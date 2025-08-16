'use client';

import { useEffect, useMemo, useState } from 'react';
import { AssignResp, DecideResp, StartResp } from './types'
import IntroModal from './IntroModal';
import OfferModal from './not-yet-flow/OfferModal';
import DeclinedSurveyModal from './not-yet-flow/DeclinedSurveyModal';
import AcceptedModal from './not-yet-flow/AcceptedModal';
import CancelReasonModal from './not-yet-flow/CancelReasonModal';
import CancelledModal from './not-yet-flow/CancelledModal';
import JobCongratsModal from './yes-flow/JobCongratsModal';
import JobImproveModal from './yes-flow/JobImproveModal';
import VisaStepModal from './yes-flow/VisaStepModal';
import JobDoneModal from './yes-flow/JobDoneModal';



const REASON_LABELS = {
    too_expensive: 'Too expensive',
    not_helpful: 'Platform not helpful',
    not_enough: 'Not enough relevant jobs',
    not_moving: 'Decided not to move',
    other: 'Other',
} as const;

type ReasonKey = keyof typeof REASON_LABELS;

export default function CancelFlow({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [start, setStart] = useState<StartResp | null>(null);

    // Which modal is currently visible
    const [showIntro, setShowIntro] = useState(false);
    const [showOffer, setShowOffer] = useState(false);
    const [showDeclinedSurvey, setShowDeclinedSurvey] = useState(false);
    const [showAccepted, setShowAccepted] = useState(false);
    const [showCancelled, setShowCancelled] = useState(false);
    const [showReasons, setShowReasons] = useState(false);

    const [offerCents, setOfferCents] = useState<number | null>(null);
    const [reason, setReason] = useState('');

    // yes branch states
    const [showJobCongrats, setShowJobCongrats] = useState(false);
    const [showJobImprove, setShowJobImprove] = useState(false);
    const [showVisaStep, setShowVisaStep] = useState(false);
    const [showJobDone, setShowJobDone] = useState(false);
    const [foundWithMM, setFoundWithMM] = useState<boolean | null>(null);
    const [needsVisaHelp, setNeedsVisaHelp] = useState<boolean>(false);

    const [toast, setToast] = useState<{ message: string; visible: boolean }>({
        message: '',
        visible: false,
    });

    const computedOffer = useMemo(
        () => offerCents ?? (start ? Math.max(0, start.priceCents - 1000) : 0),
        [offerCents, start]
    );

    useEffect(() => {
        console.log("Cancel flow")
    })

    // Kick off start flow on open
    useEffect(() => {
        if (!open) return;

        setShowIntro(false);
        setShowOffer(false);
        setShowDeclinedSurvey(false);
        setShowAccepted(false);
        setShowCancelled(false);
        setStart(null);
        setReason('');
        setOfferCents(null);
        setToast({ message: '', visible: false });
        setShowReasons(false)

        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch('/api/cancel/start', { method: 'POST' });

            if (res.status === 404) {
                setLoading(false);
                if (cancelled) return;
                setToast({ message: "You don't have an active subscription", visible: true });
                setTimeout(() => {
                    setToast({ message: '', visible: false });
                    onClose();
                }, 1500);
                return;
            }
            if (!res.ok) {
                setLoading(false);
                if (cancelled) return;
                setToast({ message: 'Something went wrong. Please try again.', visible: true });
                setTimeout(() => {
                    setToast({ message: '', visible: false });
                    onClose();
                }, 1500);
                return;
            }

            const data = (await res.json()) as StartResp;
            if (cancelled) return;
            setStart(data);
            setLoading(false);
            setShowIntro(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [open]);

    // Assign variant only when user chooses "Not yet"
    const ensureVariant = async () => {
        if (!start) return null;
        if (start.variant) {
            if (start.variant === 'B' && offerCents == null) {
                setOfferCents(Math.max(0, start.priceCents - 1000));
            }
            return start.variant;
        }
        setLoading(true);
        const res = await fetch('/api/cancel/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriptionId: start.subscriptionId }),
        });
        setLoading(false);
        if (!res.ok) return null;
        const data = (await res.json()) as AssignResp;
        setStart({
            subscriptionId: start.subscriptionId,
            priceCents: data.priceCents,
            variant: data.variant,
        });
        setOfferCents(data.offerCents);
        return data.variant;
    };

    const handleNotYet = async () => {
        const v = await ensureVariant();
        setShowIntro(false);
        if (v === 'B') setShowOffer(true);
        else setShowDeclinedSurvey(true);
    };

    const decide = async (accepted: boolean, reasonOverride?: string) => {
        if (!start) return;
        setLoading(true);
        setShowIntro(false);
        setShowOffer(false);
        setShowDeclinedSurvey(false);
        setShowReasons(false)

        const res = await fetch('/api/cancel/decide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscriptionId: start.subscriptionId,
                accepted,
                // use override if provided; otherwise fall back to state
                reason: accepted ? 'still_looking' : (reasonOverride ?? reason),
            }),
        });
        setLoading(false);
        if (!res.ok) {
            setToast({ message: 'Something went wrong. Please try again.', visible: true });
            setTimeout(() => setToast({ message: '', visible: false }), 1800);
            return;
        }
        const { status } = (await res.json()) as DecideResp;
        if (status === 'active') setShowAccepted(true);
        else setShowCancelled(true);


    };

    return (
        <>
            {toast.visible && (
                <div className="fixed right-4 top-4 z-[60] rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700 shadow">
                    {toast.message}
                </div>
            )}

            <IntroModal
                open={showIntro}
                loading={loading}
                onClose={onClose}
                onYesFoundJob={() => {
                    setShowIntro(false);
                    setShowJobCongrats(true);
                }}
                onNotYet={handleNotYet}
            />

            {start && (
                <OfferModal
                    open={showOffer}
                    onClose={onClose}
                    onBack={() => {
                        setShowIntro(true)
                        setShowOffer(false)
                    }}
                    priceCents={start.priceCents}
                    offerCents={computedOffer}
                    onAccept={() => decide(true)}
                    onDecline={() => {
                        setShowOffer(false);
                        setShowDeclinedSurvey(true);
                    }}
                />
            )}

            {start && (
                <DeclinedSurveyModal
                    open={showDeclinedSurvey}
                    onClose={onClose}
                    onBack={() => {
                        if (start?.variant === 'B') { setShowDeclinedSurvey(false); setShowOffer(true); }
                        else { setShowDeclinedSurvey(false); setShowIntro(true); }
                    }}
                    reason={reason}
                    onReason={() => { /* ignore */ }}
                    priceCents={start.priceCents}
                    offerCents={offerCents}
                    onAcceptOffer={() => decide(true)}
                    onContinue={() => {
                        setShowDeclinedSurvey(false);
                        setShowReasons(true);
                    }}

                    // onConfirmCancel={() => decide(false)}
                    stepCurrent={start.variant === 'B' ? 2 : 1}
                    stepTotal={start.variant === 'B' ? 3 : 2}
                />
            )}

            {start && (
                <CancelReasonModal
                    open={showReasons}
                    onClose={onClose}
                    onBack={() => { setShowReasons(false); setShowDeclinedSurvey(true); }}
                    priceCents={start.priceCents}
                    offerCents={offerCents}
                    stepCurrent={start.variant === 'B' ? 3 : 2}
                    stepTotal={start.variant === 'B' ? 3 : 2}
                    onAcceptOffer={() => { void decide(true); }}
                    onComplete={(payload) => {
                        const label = REASON_LABELS[(payload.type as ReasonKey)] ?? payload.type;
                        const explanation = payload.text?.trim();
                        const finalReason = explanation ? `${label} - ${explanation}` : label;
                        setReason(finalReason);
                        setShowReasons(false);      // hide this step immediately
                        void decide(false, finalReason);         // finish flow
                    }}
                />
            )}

            <AcceptedModal open={showAccepted} onClose={onClose} />
            <CancelledModal open={showCancelled} onClose={onClose} />

            <JobCongratsModal
                open={showJobCongrats}
                onClose={onClose}
                onBack={() => { setShowJobCongrats(false); setShowIntro(true); }}
                onContinue={(found) => {
                    setFoundWithMM(found);
                    setShowJobCongrats(false);
                    setShowJobImprove(true);
                }}
                stepCurrent={1}
                stepTotal={3}
            />

            <JobImproveModal
                open={showJobImprove}
                onClose={onClose}
                onBack={() => { setShowJobImprove(false); setShowJobCongrats(true); }}
                onContinue={() => { setShowJobImprove(false); setShowVisaStep(true); }}
                stepCurrent={2}
                stepTotal={3}
            />

            {foundWithMM !== null && (
                <VisaStepModal
                    open={showVisaStep}
                    onClose={onClose}
                    onBack={() => { setShowVisaStep(false); setShowJobImprove(true); }}
                    foundWithMM={foundWithMM}
                    onComplete={(needsHelp) => {
                        setNeedsVisaHelp(needsHelp);
                        setShowVisaStep(false);
                        setShowJobDone(true);
                    }}
                    stepCurrent={3}
                    stepTotal={3}
                />
            )}

            <JobDoneModal
                open={showJobDone}
                onClose={() => {
                    // close the whole flow
                    setShowJobDone(false);
                    onClose();
                }}
                needsVisaHelp={needsVisaHelp}
            />
        </>
    );
}
