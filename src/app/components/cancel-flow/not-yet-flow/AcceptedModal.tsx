// not-yet-flow/AcceptedModal.tsx
'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';
import { formatCents } from '../format';

const HERO_SRC = '/empire-state.jpg';

export default function AcceptedModal({
    open,
    onClose,
    offer
}: {
    open: boolean;
    onClose: () => void;
    offer: number
}) {
    return (
        <BaseModal open={open} title="Subscription" onClose={onClose}>
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="flex flex-col">
                    <div className="space-y-4">
                        <h2 className="text-[30px] md:text-[34px] font-semibold leading-[1.15] text-slate-900">
                            Great choice, mate!
                        </h2>

                        <div className="space-y-1">
                            <p className="text-[22px] md:text-[26px] font-semibold leading-snug text-slate-800">
                                You’re still on the path to your dream role.{' '}
                                <span className="text-[#8952fc]">
                                    Let’s make it happen together!
                                </span>
                            </p>
                        </div>

                        <div className="space-y-1 text-[15px] text-slate-600">
                            <p>You’ve got XX days left on your current plan.</p>
                            <p>
                                Starting from XX date, your monthly payment will be <strong>{formatCents(offer)}</strong>.
                            </p>
                            <p className="mt-2 text-[13px] italic text-slate-400">
                                You can cancel anytime before then.
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="-mx-6 my-4 md:mx-0">
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA pinned to bottom of left column */}
                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-[#8952fc] py-3 font-medium text-white hover:brightness-105"
                        >
                            Land your dream role
                        </button>
                    </div>
                </div>

                {/* RIGHT image – fills column height */}
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
