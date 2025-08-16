// yes-flow/VisaStepModal.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function VisaStepModal({
    open,
    onClose,
    onBack,
    foundWithMM,              // from step 1
    onComplete,               // (needsHelp: boolean)
    stepCurrent,
    stepTotal,
}: {
    open: boolean;
    onClose: () => void;
    onBack?: () => void;
    foundWithMM: boolean;
    onComplete: (needsHelp: boolean) => void;
    stepCurrent: number;
    stepTotal: number;
}) {
    const [hasLawyer, setHasLawyer] = useState<boolean | null>(null);
    const [visa, setVisa] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (!open) {
            setHasLawyer(null);
            setVisa('');
            setShowErrors(false);
        }
    }, [open]);

    const ready = hasLawyer !== null && visa.trim().length > 0;

    const needHasLawyer = showErrors && hasLawyer === null;
    const needVisa = showErrors && visa.trim().length === 0;

    const handleSubmit = () => {
        if (!ready) {
            setShowErrors(true);
            return;
        }
        // needsHelp = user does NOT have a company-provided lawyer
        onComplete(!hasLawyer);
    };

    const OPTIONS = [
        { val: true, label: 'Yes' },
        { val: false, label: 'No' },
    ];
    const optionsToShow =
        hasLawyer === null ? OPTIONS : OPTIONS.filter((o) => o.val === hasLawyer);

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            onBack={onBack}
            title="Subscription Cancellation"
            progress={{ current: stepCurrent, total: stepTotal }}
        >
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT (make it a flex column) */}
                <div className="flex h-full flex-col">
                    {/* Content stack */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                                {foundWithMM
                                    ? 'We helped you land the job, now let’s help you secure your visa.'
                                    : 'You landed the job! That’s what we live for.'}
                            </h2>
                            {!foundWithMM && (
                                <p className="text-slate-600">
                                    Even if it wasn’t through MigrateMate, let us help get your visa
                                    sorted.
                                </p>
                            )}
                        </div>

                        {/* Top helper when user tries too soon */}
                        {showErrors && !ready && (
                            <div className="text-[13px] leading-5 text-red-600">
                                Please complete all required fields<span className="ml-0.5">*</span>
                            </div>
                        )}

                        {/* Lawyer radios (collapse to the chosen one) */}
                        <div className="space-y-2">
                            <div className="text-[14px] font-medium text-slate-700">
                                Is your company providing an immigration lawyer to help with your
                                visa?*
                            </div>
                            <div className="space-y-2 text-slate-700">
                                {optionsToShow.map((o) => (
                                    <label key={String(o.val)} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={hasLawyer === o.val}
                                            onChange={() => setHasLawyer(o.val)}
                                        />
                                        <span>{o.label}</span>
                                    </label>
                                ))}
                            </div>
                            {needHasLawyer && (
                                <div className="text-[12px] text-red-600">Please select Yes or No.</div>
                            )}
                        </div>

                        {/* Visa input (visible once a radio is chosen) */}
                        {hasLawyer !== null && (
                            <div className="space-y-2">
                                <div className="text-[14px] font-medium text-slate-700">
                                    {hasLawyer
                                        ? 'What visa will you be applying for?*'
                                        : 'We can connect you with one of our trusted partners. Which visa would you like to apply for?*'}
                                </div>
                                <input
                                    className={[
                                        'w-full max-w-[620px] rounded-lg border bg-white px-3 py-2.5 outline-none text-slate-700',
                                        needVisa
                                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-300 focus:ring-2 focus:ring-[#8952fc]/30',
                                    ].join(' ')}
                                    value={visa}
                                    onChange={(e) => setVisa(e.target.value)}
                                    aria-invalid={needVisa}
                                />
                                {needVisa && (
                                    <div className="text-[12px] text-red-600">This field is required.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom area pinned */}
                    <div className="mt-auto pt-6 md:pt-6">
                        <div className="-mx-6 mt-3 md:mt-4">
                            <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                            <div className="hidden h-px w-full bg-slate-200 md:block" />
                        </div>

                        <div className="my-4"></div>

                        <button
                            onClick={handleSubmit}
                            className={[
                                'w-full rounded-xl py-3 font-medium',
                                ready
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-slate-100 text-slate-400',
                            ].join(' ')}
                        >
                            Complete cancellation
                        </button>
                    </div>
                </div>

                {/* RIGHT image — match column height */}
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
