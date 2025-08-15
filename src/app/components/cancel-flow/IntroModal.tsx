'use client';

import Image from 'next/image';
import BaseModal from './BaseModal';
import { useEffect } from 'react';

const HERO_SRC = '/empire-state.jpg';

export default function IntroModal({
    open,
    loading,
    onClose,
    onYesFoundJob,
    onNotYet,
}: {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onYesFoundJob: () => void;
    onNotYet: () => void;
}) {


    useEffect(() => {
        console.log("Intro modal")
    })


    return (
        <BaseModal open={open} title="Subscription Cancellation" onClose={onClose}>
            {loading ? (
                <div className="p-10 text-center text-slate-600">Loading…</div>
            ) : (
                <div className="antialiased grid grid-cols-1 gap-2 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                    <div className="order-1 overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5 shadow-[0_10px_24px_rgba(2,6,23,0.08)] md:order-2">
                        <div className="relative h-[200px] w-full md:h-[360px]">
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
                                    onClick={onYesFoundJob}
                                    className="w-full rounded-[12px] border border-2 border-slate-200 bg-white px-4 py-[14px] text-center text-[17px] font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                >
                                    Yes, I’ve found a job
                                </button>
                                <button
                                    onClick={onNotYet}
                                    className="w-full rounded-[12px] border border-2 border-slate-200 bg-white px-4 py-[14px] text-center text-[17px] font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                >
                                    Not yet — I’m still looking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BaseModal>
    );
}
