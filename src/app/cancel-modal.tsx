'use client';

import { useEffect, useState } from 'react';

type StartResp = {
    subscriptionId: string;
    priceCents: number;
    variant: 'A' | 'B' | null;
};

type AssignResp = {
    variant: 'A' | 'B';
    priceCents: number;
    offerCents: number;
};

function formatCents(c: number) {
    return `$${(c / 100).toFixed(2)}`;
}

export default function CancelModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [start, setStart] = useState<StartResp | null>(null);
    const [branch, setBranch] = useState<'found' | 'looking' | null>(null);
    const [step, setStep] = useState<'intro' | 'offer' | 'foundJob' | 'survey' | 'done'>('intro');
    const [reason, setReason] = useState('');
    const [offerCents, setOfferCents] = useState<number | null>(null);
    const [finalStatus, setFinalStatus] = useState<'active' | 'cancelled' | null>(null);

    // NEW: toast state
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({
        message: '',
        visible: false,
    });

    // Start flow when opened: mark pending; DO NOT assign variant here
    useEffect(() => {
        if (!open) return;

        setBranch(null);
        setStep('intro');
        setReason('');
        setStart(null);
        setOfferCents(null);
        setFinalStatus(null);
        setToast({ message: '', visible: false });

        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch('/api/cancel/start', { method: 'POST' });

            // Handle "no active subscription"
            if (res.status === 404) {
                console.log(res)
                setLoading(false);
                setToast({ message: "You don't have an active subscription", visible: true });
                setTimeout(() => {
                    setToast({ message: '', visible: false });
                    onClose();
                }, 1500);
                return;
            }

            // Handle other failures
            if (!cancelled && !res.ok) {
                setLoading(false);
                setToast({ message: 'Something went wrong. Please try again.', visible: true });
                setTimeout(() => {
                    if (!cancelled) {
                        setToast({ message: '', visible: false });
                        onClose();
                    }
                }, 2200);
                return;
            }

            if (!cancelled) {
                const data = (await res.json()) as StartResp;
                setStart(data);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, onClose]);

    if (!open) return null;

    // Called only when user said "Not yet — I'm still looking"
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
        setStart({ subscriptionId: start.subscriptionId, priceCents: data.priceCents, variant: data.variant });
        setOfferCents(data.offerCents);
        return data.variant;
    };

    const handleIntro = async (foundJob: boolean) => {
        if (foundJob) {
            setBranch('found');
            setStep('foundJob');
        } else {
            setBranch('looking');
            const v = await ensureVariant();
            if (v === 'B') setStep('offer');
            else setStep('survey');
        }
    };

    const decide = async (accepted: boolean) => {
        if (!start) return;
        setLoading(true);
        const res = await fetch('/api/cancel/decide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscriptionId: start.subscriptionId,
                accepted,
                reason: branch === 'found' ? 'found_job' : reason,
            }),
        });
        setLoading(false);
        if (res.ok) {
            const { status } = (await res.json()) as { status: 'active' | 'cancelled' };
            setFinalStatus(status);
        }
        setStep('done');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white p-4 md:p-6 shadow-xl">
                {/* TOAST (top-right) */}
                {toast.visible && (
                    <div
                        className="pointer-events-none absolute right-4 top-4 z-50 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-700 shadow-md"
                        role="status"
                        aria-live="polite"
                    >
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-slate-500">Subscription Cancellation</div>
                    <button onClick={onClose} className="rounded-md px-2 py-1 hover:bg-slate-100">
                        ✕
                    </button>
                </div>

                {/* When showing a toast due to 404/500, hide the body to avoid flashing the flow */}
                {toast.visible ? null : (
                    <>
                        {/* Body */}
                        {loading && <div className="p-8 text-center">Loading…</div>}

                        {!loading && step === 'intro' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">
                                        Hey mate, quick one before you go.
                                        <br />
                                        <span className="font-bold">Have you found a job yet?</span>
                                    </h2>
                                    <p className="text-slate-600">Whatever your answer, we’ll help you take the next step.</p>
                                    <div className="space-y-3 pt-2">
                                        <button onClick={() => handleIntro(true)} className="w-full rounded-xl border px-4 py-3 text-left hover:bg-slate-50">
                                            Yes, I’ve found a job
                                        </button>
                                        <button onClick={() => handleIntro(false)} className="w-full rounded-xl border px-4 py-3 text-left hover:bg-slate-50">
                                            Not yet — I’m still looking
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden overflow-hidden rounded-xl md:block">
                                    <img alt="" src="/main.png" className="h-full w-full object-cover" />
                                </div>
                            </div>
                        )}

                        {!loading && step === 'offer' && start && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">
                                        We built this to help you land the job — here’s 50% off until you do.
                                    </h2>
                                    <div className="rounded-2xl border bg-emerald-50 p-4 md:p-5">
                                        <div className="text-lg font-semibold md:text-xl">
                                            {formatCents(offerCents ?? Math.max(0, start.priceCents - 1000))}
                                            <span className="text-sm text-slate-500"> /month</span>
                                            <span className="ml-2 text-sm text-slate-400 line-through">{formatCents(start.priceCents)}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600">You won’t be charged until your next billing date.</p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => decide(true)} className="flex-1 rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600">
                                            Get 50% off
                                        </button>
                                        <button onClick={() => setStep('survey')} className="flex-1 rounded-xl border py-3 hover:bg-slate-50">
                                            No thanks
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden overflow-hidden rounded-xl md:block">
                                    <img alt="" src="/main.png" className="h-full w-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Found-job branch: visual-only survey, nothing persisted */}
                        {!loading && step === 'foundJob' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">Congrats on the new role! 🎉</h2>
                                    <div className="space-y-3">
                                        <label className="mb-1 block text-sm text-slate-600">Did you find this job with MigrateMate?*</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">Yes</button>
                                            <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">No</button>
                                        </div>
                                        {['How many roles did you apply for through MigrateMate?', 'How many companies did you email directly?', 'How many different companies did you interview with?'].map(
                                            (q) => (
                                                <div key={q}>
                                                    <label className="mb-1 block text-sm text-slate-600">{q}*</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['0', '1–5', '6–20', '20+'].map((opt) => (
                                                            <button key={opt} className="rounded-xl border px-3 py-2 hover:bg-slate-50">
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <button onClick={() => decide(false)} className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-slate-800">
                                        Continue
                                    </button>
                                </div>
                                <div className="hidden overflow-hidden rounded-xl md:block">
                                    <img alt="" src="/main.png" className="h-full w-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Generic survey for other paths (A or B declined) */}
                        {!loading && step === 'survey' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">Tell us why you’re leaving</h2>
                                    <textarea
                                        className="min-h-[120px] w-full rounded-xl border p-3"
                                        placeholder="Optional: your reason (we’ll use this to improve)"
                                        maxLength={500}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={() => decide(false)} className="flex-1 rounded-xl bg-red-500 py-3 font-medium text-white hover:bg-red-600">
                                            Confirm cancellation
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden overflow-hidden rounded-xl md:block">
                                    <img alt="" src="/main.png" className="h-full w-full object-cover" />
                                </div>
                            </div>
                        )}

                        {!loading && step === 'done' && (
                            <div className="space-y-3 p-8 text-center">
                                <h3 className="text-xl font-semibold">{finalStatus === 'active' ? 'Discount applied' : 'All set'}</h3>
                                <p className="text-slate-600">
                                    {finalStatus === 'active'
                                        ? 'You kept your subscription and we’ve applied your selection.'
                                        : 'We’ve saved your choice. You can close this window.'}
                                </p>
                                <button onClick={onClose} className="rounded-xl border px-4 py-2 hover:bg-slate-50">
                                    Close
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
