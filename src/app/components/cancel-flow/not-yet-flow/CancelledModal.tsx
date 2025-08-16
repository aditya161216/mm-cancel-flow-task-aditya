// not-yet-flow/CancelledModal.tsx
'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function CancelledModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Subscription Cancelled"
            // show green “Completed” pills in the header
            progress={{ current: 3, total: 3, done: true }}
        >
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="flex flex-col">
                    {/* Mobile (shown only on <md) */}
                    <div className="md:hidden overflow-hidden rounded-[14px] border border-slate-200 mb-4">
                        <div className="relative w-full aspect-[16/9]">
                            <Image
                                src={HERO_SRC}
                                alt="New York skyline"
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority
                            />
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                            Sorry to see you go, mate.
                        </h2>
                        <h3 className="text-[22px] md:text-[24px] font-semibold leading-[1.2] text-slate-900">
                            Thanks for being with us, and you’re always welcome back.
                        </h3>

                        <div className="text-[14px] text-slate-700">
                            <div className="font-semibold">
                                Your subscription is set to end on XX date.
                            </div>
                            <div className="text-slate-600">
                                You’ll still have full access until then. No further charges after that.
                            </div>
                        </div>

                        <p className="text-[13px] text-slate-500">
                            Changed your mind? You can reactivate anytime before your end date.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="-mx-6 my-4 md:mx-0">
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA pinned to bottom of left column */}
                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-[#8b5cf6] py-3 font-semibold text-white hover:bg-[#7c4cf4]"
                        >
                            Back to Jobs
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
