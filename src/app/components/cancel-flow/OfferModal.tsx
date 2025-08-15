'use client';

import Image from 'next/image';
import BaseModal from './BaseModal';
import { formatCents } from './format';
import { useEffect } from 'react';

const HERO_SRC = '/empire-state.jpg';

export default function OfferModal({
    open,
    onClose,
    onBack,
    priceCents,
    offerCents,
    onAccept,
    onDecline,
}: {
    open: boolean;
    onClose: () => void;
    onBack?: () => void;
    priceCents: number;
    offerCents: number;
    onAccept: () => void;
    onDecline: () => void;
}) {

    useEffect(() => {
        console.log("Offer modal")
    })


    return (
        <BaseModal open={open} title="Subscription Cancellation" onClose={onClose} onBack={onBack} progress={{ current: 1, total: 3 }}>
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                <div className="space-y-4">
                    <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
                        We built this to help you land the job — here’s 50% off until you do.
                    </h2>

                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-0.5">
                        <div className="rounded-2xl bg-white/70 p-4">
                            <div className="rounded-xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-4">
                                <div className="text-lg md:text-xl font-semibold">
                                    {formatCents(offerCents)}
                                    <span className="text-sm text-slate-500"> /month</span>
                                    <span className="ml-2 text-sm text-slate-400 line-through">
                                        {formatCents(priceCents)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                    You won’t be charged until your next billing date.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onAccept}
                            className="flex-1 rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
                        >
                            Get 50% off
                        </button>
                        <button
                            onClick={onDecline}
                            className="flex-1 rounded-xl border border-slate-200 py-3 hover:bg-slate-50"
                        >
                            No thanks
                        </button>
                    </div>
                </div>

                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-[360px] w-full">
                        <Image src={HERO_SRC} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
