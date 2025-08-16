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
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (!open) {
            setVal('');
            setShowErrors(false);
        }
    }, [open]);

    const minChars = 25;
    const tooShort = val.trim().length < minChars;

    const submit = () => {
        if (tooShort) {
            setShowErrors(true);
            return;
        }
        onContinue();
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
                <div className="space-y-4">
                    <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                        What’s one thing you wish we could’ve helped you with?
                    </h2>
                    <p className="text-slate-700 -mt-1">
                        We’re always looking to improve; your thoughts can help us make Migrate Mate more useful for others.*
                    </p>

                    {/* helper line only after attempted submit */}
                    {showErrors && tooShort && (
                        <div className="text-[13px] leading-5 text-red-600">
                            Please enter at least 25 characters so we can understand your feedback<span className="ml-0.5">*</span>
                        </div>
                    )}

                    <div className="relative max-w-[680px] text-slate-700">
                        <textarea
                            rows={5}
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            placeholder=""
                        />
                        <div className="absolute bottom-2 right-3 text-[11px] text-slate-400">
                            Min {minChars} characters ({val.trim().length}/{minChars})
                        </div>
                    </div>

                    {/* spacer only — removed visible divider */}
                    <div className="h-2" />

                    {/* keep clickable; style reflects validity */}
                    <button
                        onClick={submit}
                        className={[
                            'w-full rounded-xl py-3 font-medium',
                            !tooShort ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400',
                        ].join(' ')}
                    >
                        Continue
                    </button>
                </div>

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
