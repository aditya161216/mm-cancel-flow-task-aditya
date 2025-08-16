'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

type Pill = 0 | 1 | 2 | 3;
const Q1 = ['0', '1 – 5', '6 – 20', '20+'] as const;
const Q2 = ['0', '1–5', '6–20', '20+'] as const;
const Q3 = ['0', '1–2', '3–5', '5+'] as const;

export default function JobCongratsModal({
    open,
    onClose,
    onBack,
    onContinue,
    stepCurrent,
    stepTotal,
}: {
    open: boolean;
    onClose: () => void;
    onBack?: () => void;
    onContinue: (foundWithMM: boolean) => void;
    stepCurrent: number;
    stepTotal: number;
}) {
    const [foundWithMM, setFoundWithMM] = useState<boolean | null>(null);
    const [roles, setRoles] = useState<Pill | null>(null);
    const [emails, setEmails] = useState<Pill | null>(null);
    const [interviews, setInterviews] = useState<Pill | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (!open) {
            setFoundWithMM(null);
            setRoles(null);
            setEmails(null);
            setInterviews(null);
            setShowErrors(false);
        }
    }, [open]);

    const pillBase =
        'h-9 rounded-xl border text-sm px-3 flex items-center justify-center transition-colors';
    const un = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
    const sel = 'border-transparent bg-[#8952fc] text-white shadow';
    const err = 'border-red-300';

    const filled =
        foundWithMM !== null && roles !== null && emails !== null && interviews !== null;

    const needFound = showErrors && foundWithMM === null;
    const needRoles = showErrors && roles === null;
    const needEmails = showErrors && emails === null;
    const needInterviews = showErrors && interviews === null;

    const handleContinue = () => {
        if (!filled) {
            setShowErrors(true);
            return;
        }
        onContinue(foundWithMM!);
    };

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            onBack={onBack}
            title="Subscription Cancellation"
            progress={{ current: stepCurrent, total: stepTotal }}
        >
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="space-y-5">
                    <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                        Congrats on the new role! 🎉
                    </h2>

                    {/* Top helper error */}
                    {showErrors && !filled && (
                        <div className="text-[13px] leading-5 text-red-600">
                            Please complete all required fields<span className="ml-0.5">*</span>
                        </div>
                    )}

                    {/* Found with MM */}
                    <div className="space-y-2">
                        <div className="text-[15px] font-medium text-slate-700">
                            Did you find this job with MigrateMate?*
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                className={[
                                    pillBase,
                                    foundWithMM === true ? sel : un,
                                    needFound && foundWithMM !== true ? err : '',
                                ].join(' ')}
                                onClick={() => setFoundWithMM(true)}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                className={[
                                    pillBase,
                                    foundWithMM === false ? sel : un,
                                    needFound && foundWithMM !== false ? err : '',
                                ].join(' ')}
                                onClick={() => setFoundWithMM(false)}
                            >
                                No
                            </button>
                        </div>
                        {needFound && (
                            <div className="text-[12px] text-red-600">Please select Yes or No.</div>
                        )}
                    </div>

                    {/* Counts (all required) */}
                    <div className="space-y-4">
                        {/* Roles */}
                        <div className="space-y-2">
                            <div className="text-[14px] font-medium text-slate-700">
                                How many roles did you apply for through MigrateMate?*
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {Q1.map((lbl, i) => (
                                    <button
                                        key={lbl}
                                        type="button"
                                        className={[
                                            pillBase,
                                            roles === i ? sel : un,
                                            needRoles && roles !== i ? err : '',
                                        ].join(' ')}
                                        onClick={() => setRoles(i as Pill)}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                            {needRoles && (
                                <div className="text-[12px] text-red-600">Please choose one option.</div>
                            )}
                        </div>

                        {/* Emails */}
                        <div className="space-y-2">
                            <div className="text-[14px] font-medium text-slate-700">
                                How many companies did you email directly?*
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {Q2.map((lbl, i) => (
                                    <button
                                        key={lbl}
                                        type="button"
                                        className={[
                                            pillBase,
                                            emails === i ? sel : un,
                                            needEmails && emails !== i ? err : '',
                                        ].join(' ')}
                                        onClick={() => setEmails(i as Pill)}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                            {needEmails && (
                                <div className="text-[12px] text-red-600">Please choose one option.</div>
                            )}
                        </div>

                        {/* Interviews */}
                        <div className="space-y-2">
                            <div className="text-[14px] font-medium text-slate-700">
                                How many different companies did you interview with?*
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {Q3.map((lbl, i) => (
                                    <button
                                        key={lbl}
                                        type="button"
                                        className={[
                                            pillBase,
                                            interviews === i ? sel : un,
                                            needInterviews && interviews !== i ? err : '',
                                        ].join(' ')}
                                        onClick={() => setInterviews(i as Pill)}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                            {needInterviews && (
                                <div className="text-[12px] text-red-600">Please choose one option.</div>
                            )}
                        </div>
                    </div>

                    {/* divider */}
                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

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
