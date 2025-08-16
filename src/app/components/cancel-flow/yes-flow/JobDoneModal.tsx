// yes-flow/JobDoneModal.tsx
'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function JobDoneModal({
    open,
    onClose,
    needsVisaHelp,
}: {
    open: boolean;
    onClose: () => void;
    needsVisaHelp: boolean;
}) {
    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Subscription Cancelled"
        >
            {/* Make both columns the same height */}
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="flex flex-col">
                    <div className="space-y-4">
                        {needsVisaHelp ? (
                            <>
                                <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                                    Your cancellation’s all sorted, mate, no more charges.
                                </h2>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
                                    <div className="text-[14px] leading-6">
                                        I’ll be reaching out soon to help with the visa side of things.
                                        <br />
                                        We’ve got your back — whether it’s questions, paperwork, or just
                                        figuring out your options. Keep an eye on your inbox.
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                                    All done, your cancellation’s been processed.
                                </h2>
                                <p className="text-[15px] text-slate-600">
                                    We’re stoked to hear you’ve landed a job and sorted your visa. Big
                                    congrats from the team. 🎉
                                </p>
                            </>
                        )}
                    </div>

                    {/* divider */}
                    <div className="-mx-6 my-4 md:mx-0">
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA pinned to bottom of the left column */}
                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-[#8b5cf6] py-3 font-semibold text-white hover:bg-[#7c4cf4]"
                        >
                            Finish
                        </button>
                    </div>
                </div>

                {/* RIGHT image – fills the row height */}
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
