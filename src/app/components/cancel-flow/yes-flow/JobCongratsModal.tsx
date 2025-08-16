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
    onContinue: (foundWithMM: boolean) => void; // pass to Step 3 later
    stepCurrent: number;
    stepTotal: number;
}) {
    const [foundWithMM, setFoundWithMM] = useState<boolean | null>(null);
    const [roles, setRoles] = useState<Pill | null>(null);
    const [emails, setEmails] = useState<Pill | null>(null);
    const [interviews, setInterviews] = useState<Pill | null>(null);

    useEffect(() => {
        if (!open) {
            setFoundWithMM(null);
            setRoles(null);
            setEmails(null);
            setInterviews(null);
        }
    }, [open]);

    const pill = 'h-9 rounded-xl border text-sm px-3 flex items-center justify-center';
    const un = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
    const sel = 'border-transparent bg-[#8952fc] text-white shadow';

    const canContinue = useMemo(() => foundWithMM !== null, [foundWithMM]);

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

                    <div className="space-y-2">
                        <div className="text-[15px] font-medium text-slate-700">
                            Did you find this job with MigrateMate?*
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                className={`h-10 rounded-xl border ${pill} ${foundWithMM === true ? sel : un}`}
                                onClick={() => setFoundWithMM(true)}
                            >
                                Yes
                            </button>
                            <button
                                className={`h-10 rounded-xl border ${pill} ${foundWithMM === false ? sel : un}`}
                                onClick={() => setFoundWithMM(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>

                    {/* Optional counts (visual only) */}
                    <div className="space-y-4">
                        {[
                            { label: 'How many roles did you apply for through MigrateMate?', data: Q1, val: roles, set: setRoles },
                            { label: 'How many companies did you email directly?', data: Q2, val: emails, set: setEmails },
                            { label: 'How many different companies did you interview with?', data: Q3, val: interviews, set: setInterviews },
                        ].map((g) => (
                            <div key={g.label} className="space-y-2">
                                <div className="text-[14px] font-medium text-slate-700">{g.label}<span className="text-slate-400">*</span></div>
                                <div className="grid grid-cols-4 gap-2">
                                    {g.data.map((lbl, i) => (
                                        <button
                                            key={lbl}
                                            className={`${pill} ${g.val === i ? sel : un}`}
                                            onClick={() => g.set(i as Pill)}
                                            type="button"
                                        >
                                            {lbl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* divider */}
                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    <button
                        disabled={!canContinue}
                        onClick={() => foundWithMM !== null && onContinue(foundWithMM)}
                        className={`w-full rounded-xl py-3 font-medium ${canContinue ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                        Continue
                    </button>
                </div>

                {/* RIGHT image */}
                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-full min-h-[220px] w-full">
                        <Image src={HERO_SRC} alt="New York skyline" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" priority />
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
