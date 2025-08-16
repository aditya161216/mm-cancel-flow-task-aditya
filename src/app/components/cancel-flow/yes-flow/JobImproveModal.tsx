'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function JobImproveModal({
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
    onContinue: () => void;
    stepCurrent: number;
    stepTotal: number;
}) {
    const [val, setVal] = useState('');

    useEffect(() => {
        if (!open) setVal('');
    }, [open]);

    const ok = val.trim().length >= 25;

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            onBack={onBack}
            title="Subscription Cancellation"
            progress={{ current: stepCurrent, total: stepTotal }}
        >
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                <div className="space-y-4">
                    <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                        What’s one thing you wish we could’ve helped you with?
                    </h2>
                    <p className="text-slate-600 -mt-1">
                        We’re always looking to improve; your thoughts can help us make Migrate Mate more useful for others.*
                    </p>

                    {!ok && val.length > 0 && (
                        <div className="text-[13px] text-red-600">Min 25 characters so we can understand your feedback*</div>
                    )}

                    <div className="relative max-w-[680px]">
                        <textarea
                            rows={5}
                            className={`w-full rounded-lg border bg-white px-3 py-2.5 outline-none resize-y ${ok ? 'border-slate-300 focus:ring-2 focus:ring-[#8952fc]/30' : 'border-slate-300'}`}
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            placeholder=""
                        />
                        <div className={`absolute bottom-2 right-3 text-[11px] ${ok ? 'text-slate-400' : 'text-slate-400'}`}>
                            Min 25 characters ({Math.min(val.trim().length, 25)}/25)
                        </div>
                    </div>

                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    <button
                        disabled={!ok}
                        onClick={onContinue}
                        className={`w-full rounded-xl py-3 font-medium ${ok ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                        Continue
                    </button>
                </div>

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
