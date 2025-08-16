'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function VisaStepModal({
    open,
    onClose,
    onBack,
    foundWithMM,               // from step 1
    onComplete,                // (needsHelp: boolean)
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

    useEffect(() => {
        if (!open) {
            setHasLawyer(null);
            setVisa('');
        }
    }, [open]);

    const ready = hasLawyer !== null && visa.trim().length > 0;

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            onBack={onBack}
            title="Subscription Cancellation"
            progress={{ current: stepCurrent, total: stepTotal }}
        >
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                <div className="space-y-5">
                    <div>
                        <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                            {foundWithMM ? 'We helped you land the job, now let’s help you secure your visa.' : 'You landed the job! That’s what we live for.'}
                        </h2>
                        {!foundWithMM && (
                            <p className="text-slate-600">Even if it wasn’t through MigrateMate, let us help get your visa sorted.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="text-[14px] font-medium text-slate-700">
                            Is your company providing an immigration lawyer to help with your visa?
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={hasLawyer === true} onChange={() => setHasLawyer(true)} />
                                <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={hasLawyer === false} onChange={() => setHasLawyer(false)} />
                                <span>No</span>
                            </label>
                        </div>
                    </div>

                    {hasLawyer !== null && (
                        <div className="space-y-2">
                            <div className="text-[14px] font-medium text-slate-700">
                                {hasLawyer
                                    ? 'What visa will you be applying for?*'
                                    : "We can connect you with one of our trusted partners. Which visa would you like to apply for?*"}
                            </div>
                            <input
                                className="w-full max-w-[620px] rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                value={visa}
                                onChange={(e) => setVisa(e.target.value)}
                                placeholder=""
                            />
                        </div>
                    )}

                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    <button
                        disabled={!ready}
                        onClick={() => hasLawyer !== null && onComplete(!hasLawyer)} // needsHelp = !hasLawyer
                        className={`w-full rounded-xl py-3 font-medium ${ready ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                        Complete cancellation
                    </button>
                </div>

                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-[360px] w-full">
                        <Image src={HERO_SRC} alt="New York skyline" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" priority />
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
