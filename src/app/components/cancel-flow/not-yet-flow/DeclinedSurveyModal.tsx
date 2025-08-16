'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import BaseModal from '../BaseModal';
import { formatCents } from '../format';

const HERO_SRC = '/empire-state.jpg';

type PillVal = 0 | 1 | 2 | 3;
const Q1 = ['0', '1 – 5', '6 – 20', '20+'] as const;
const Q2 = ['0', '1–5', '6–20', '20+'] as const;
const Q3 = ['0', '1–2', '3–5', '5+'] as const;

export default function DeclinedSurveyModal({
    open,
    onClose,
    onBack,
    reason,
    onReason,
    priceCents,
    offerCents,
    onAcceptOffer,
    onContinue,
    stepCurrent,
    stepTotal
}: {
    open: boolean;
    onClose: () => void;
    onBack?: () => void;
    reason: string;              // kept for compatibility (we'll write into it on Continue)
    onReason: (v: string) => void;
    priceCents: number;
    offerCents: number | null;
    onAcceptOffer: () => void;
    onContinue: (payload: { roles: string; emails: string; interviews: string }) => void;
    stepCurrent: number,
    stepTotal: number
}) {
    // local selections
    const [roles, setRoles] = useState<PillVal | null>(null);
    const [emails, setEmails] = useState<PillVal | null>(null);
    const [interviews, setInterviews] = useState<PillVal | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (!open) {
            setRoles(null);
            setEmails(null);
            setInterviews(null);
            setShowErrors(false);
        }
    }, [open]);

    const filled = roles !== null && emails !== null && interviews !== null;

    const offer = useMemo(
        () => formatCents(offerCents ?? Math.max(0, priceCents - 1000)),
        [offerCents, priceCents]
    );

    const pillBase =
        'h-10 rounded-xl border text-sm font-medium transition-colors px-4 flex items-center justify-center';
    const pillUnselected =
        'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
    const pillSelected =
        'border-transparent bg-[#8952fc] text-white shadow';
    const pillError = 'border-red-300';

    const groupLabel =
        'text-[15px] font-medium text-slate-700';
    const headline =
        'text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900';

    const handleContinue = () => {
        if (!(roles !== null && emails !== null && interviews !== null)) {
            setShowErrors(true);
            return;
        }
        const payload = {
            roles: Q1[roles as PillVal],
            emails: Q2[emails as PillVal],
            interviews: Q3[interviews as PillVal],
        };
        onContinue(payload);
    };

    return (
        <BaseModal open={open} title="Subscription Cancellation" onClose={onClose} onBack={onBack} progress={{ current: stepCurrent, total: stepTotal }}>
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="space-y-5">
                    <h2 className={headline}>
                        <span className="hidden md:inline">
                            Help us understand how you were using Migrate&nbsp;Mate.
                        </span>
                        <span className="md:hidden">
                            What’s the main reason for cancelling?
                        </span>
                    </h2>

                    {/* error helper copy */}
                    {showErrors && !filled && (
                        <div className="text-[13px] leading-5 text-red-600">
                            Mind letting us know why you’re cancelling?
                            <br className="hidden md:block" />
                            It helps us understand your experience and improve the platform.<span className="ml-0.5">*</span>
                        </div>
                    )}

                    {/* Q1 */}
                    <div className="space-y-2">
                        <div className={groupLabel}>
                            How many roles did you <span className="underline decoration-slate-300">apply</span> for through Migrate Mate?
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {Q1.map((label, idx) => {
                                const selected = roles === idx;
                                const need = showErrors && roles === null;
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setRoles(idx as PillVal)}
                                        className={[
                                            pillBase,
                                            selected ? pillSelected : pillUnselected,
                                            need && !selected ? pillError : '',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Q2 */}
                    <div className="space-y-2">
                        <div className={groupLabel}>
                            How many companies did you <span className="underline decoration-slate-300">email</span> directly?
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {Q2.map((label, idx) => {
                                const selected = emails === idx;
                                const need = showErrors && emails === null;
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setEmails(idx as PillVal)}
                                        className={[
                                            pillBase,
                                            selected ? pillSelected : pillUnselected,
                                            need && !selected ? pillError : '',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Q3 */}
                    <div className="space-y-2">
                        <div className={groupLabel}>
                            How many different companies did you <span className="underline decoration-slate-300">interview</span> with?
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {Q3.map((label, idx) => {
                                const selected = interviews === idx;
                                const need = showErrors && interviews === null;
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setInterviews(idx as PillVal)}
                                        className={[
                                            pillBase,
                                            selected ? pillSelected : pillUnselected,
                                            need && !selected ? pillError : '',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* divider */}
                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA row */}
                    <div className="space-y-3">
                        <button
                            onClick={onAcceptOffer}
                            className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
                        >
                            Get $10 off | {offer}
                            <span className="ml-2 text-sm text-slate-300 line-through">
                                {formatCents(priceCents)}
                            </span>
                        </button>

                        <button
                            onClick={handleContinue}
                            className={[
                                'w-full rounded-xl py-3 font-medium',
                                filled
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-slate-100 text-slate-400',
                            ].join(' ')}
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* RIGHT image */}
                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-full min-h-[220px] w-full">
                        <Image
                            src={HERO_SRC}
                            alt="New York skyline"
                            fill
                            sizes="(min-width: 768px) 440px, 100vw"
                            className="object-cover"
                            priority
                        />
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
