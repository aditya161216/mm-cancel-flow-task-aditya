'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const HERO_SRC = '/empire-state.jpg';

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

    // toast for 404/500
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({
        message: '',
        visible: false,
    });

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

            if (res.status === 404) {
                setLoading(false);
                setToast({ message: "You don't have an active subscription", visible: true });
                setTimeout(() => {
                    setToast({ message: '', visible: false });
                    onClose();
                }, 1500);
                return;
            }
            if (!res.ok) {
                setLoading(false);
                setToast({ message: 'Something went wrong. Please try again.', visible: true });
                setTimeout(() => {
                    setToast({ message: '', visible: false });
                    onClose();
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

    // only assign variant when “Not yet” selected
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
            <div className="relative w-full max-w-[980px] rounded-[18px] bg-white shadow-2xl ring-1 ring-black/5">
                {/* toast */}
                {toast.visible && (
                    <div
                        className="pointer-events-none absolute right-4 top-4 z-50 rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700 shadow"
                        role="status"
                        aria-live="polite"
                    >
                        {toast.message}
                    </div>
                )}

                {/* header bar */}
                <div className="relative flex items-center justify-between px-6 py-4">
                    <div className="w-full text-left md:text-center text-[14px] font-semibold tracking-normal text-slate-600">
                        Subscription Cancellation
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute right-4 top-3 inline-flex items-center justify-center
                                    h-10 w-10 md:h-8 md:w-8
                                    rounded-full
                                    text-slate-400 hover:text-slate-400 hover:bg-slate-50
                                    text-[28px] md:text-[20px] leading-none"
                    >
                        ×
                    </button>
                </div>


                {/* thin divider under header */}
                <div className="h-px w-full bg-slate-200/70" />

                {/* body */}
                {toast.visible ? null : (
                    <>
                        {loading && <div className="p-10 text-center text-slate-600">Loading…</div>}

                        {!loading && step === 'intro' && (
                            <div className="antialiased grid grid-cols-1 gap-2 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">                                {/* image FIRST on mobile, right column on desktop */}
                                <div className="order-1 overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5 shadow-[0_10px_24px_rgba(2,6,23,0.08)] md:order-2">                                    <div className="relative h-[200px] w-full md:h-[360px]">
                                    <Image
                                        src={HERO_SRC}
                                        alt="New York skyline"
                                        fill
                                        sizes="(max-width: 767px) 100vw, 440px"
                                        priority
                                        className="object-cover"
                                    />
                                    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
                                </div>
                                </div>

                                {/* text SECOND on mobile, left column on desktop */}
                                <div className="order-2 flex flex-col md:order-1">
                                    <div className="space-y-3">
                                        <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-700 md:text-[32px]">
                                            Hey mate,
                                            <br />
                                            Quick one before you go.
                                        </h2>
                                        <p className="text-[26px] italic font-semibold tracking-tight text-slate-700 md:text-[28px]">
                                            Have you found a job yet?
                                        </p>
                                        <p className="max-w-[520px] text-[15px] tracking-normal text-slate-600 font-semibold">
                                            Whatever your answer, we just want to help you take the next step.
                                            With visa support, or by hearing how we can do better.
                                        </p>

                                        <div className="-mx-6 my-2 md:mx-0">
                                            <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                                            <div className="hidden h-px w-full bg-slate-200 md:block" />
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleIntro(true)}
                                                className="w-full rounded-[12px] border border-2 border-slate-200 bg-white px-4 py-[14px] text-center text-[17px] font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                            >
                                                Yes, I’ve found a job
                                            </button>
                                            <button
                                                onClick={() => handleIntro(false)}
                                                className="w-full rounded-[12px] border border-2 border-slate-200 bg-white px-4 py-[14px] text-center text-[17px] font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                            >
                                                Not yet — I’m still looking
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* OFFER STEP (unchanged styles) */}
                        {!loading && step === 'offer' && start && (
                            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                                <div className="space-y-4">
                                    <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
                                        We built this to help you land the job — here’s 50% off until you do.
                                    </h2>
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                        <div className="text-xl font-semibold">
                                            {formatCents(offerCents ?? Math.max(0, start.priceCents - 1000))}
                                            <span className="text-sm text-slate-500"> /month</span>
                                            <span className="ml-2 text-sm text-slate-400 line-through">
                                                {formatCents(start.priceCents)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600">You won’t be charged until your next billing date.</p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => decide(true)}
                                            className="flex-1 rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
                                        >
                                            Get 50% off
                                        </button>
                                        <button
                                            onClick={() => setStep('survey')}
                                            className="flex-1 rounded-xl border border-slate-200 py-3 hover:bg-slate-50"
                                        >
                                            No thanks
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                                    <div className="relative h-[360px] w-full">
                                        <Image src={HERO_SRC} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FOUND JOB STEP (visual only) */}
                        {!loading && step === 'foundJob' && (
                            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                                <div className="space-y-4">
                                    <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
                                        Congrats on the new role! 🎉
                                    </h2>
                                    {/* Faux fields for parity */}
                                    <div className="space-y-3">
                                        <label className="mb-1 block text-sm text-slate-600">Did you find this job with MigrateMate?*</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">Yes</button>
                                            <button className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">No</button>
                                        </div>
                                        {['How many roles did you apply for through MigrateMate?',
                                            'How many companies did you email directly?',
                                            'How many different companies did you interview with?'].map((q) => (
                                                <div key={q}>
                                                    <label className="mb-1 block text-sm text-slate-600">{q}*</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['0', '1–5', '6–20', '20+'].map((opt) => (
                                                            <button key={opt} className="rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50">{opt}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <button
                                        onClick={() => decide(false)}
                                        className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-slate-800"
                                    >
                                        Continue
                                    </button>
                                </div>
                                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                                    <div className="relative h-[360px] w-full">
                                        <Image src={HERO_SRC} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SURVEY STEP */}
                        {!loading && step === 'survey' && (
                            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                                <div className="space-y-3">
                                    <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
                                        Tell us why you’re leaving
                                    </h2>
                                    <textarea
                                        className="min-h-[120px] w-full rounded-xl border border-slate-200 p-3"
                                        placeholder="Optional: your reason (we’ll use this to improve)"
                                        maxLength={500}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => decide(false)}
                                            className="flex-1 rounded-xl bg-red-500 py-3 font-medium text-white hover:bg-red-600"
                                        >
                                            Confirm cancellation
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                                    <div className="relative h-[360px] w-full">
                                        <Image src={HERO_SRC} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DONE */}
                        {!loading && step === 'done' && (
                            <div className="space-y-3 p-10 text-center">
                                <h3 className="text-xl font-semibold">
                                    {finalStatus === 'active' ? 'Discount applied' : 'All set'}
                                </h3>
                                <p className="text-slate-600">
                                    {finalStatus === 'active'
                                        ? 'You kept your subscription and we’ve applied your selection.'
                                        : 'We’ve saved your choice. You can close this window.'}
                                </p>
                                <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
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
