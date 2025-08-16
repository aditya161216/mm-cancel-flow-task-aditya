'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';
import { formatCents } from '../format';

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
    return (
        <BaseModal
            open={open}
            title="Subscription Cancellation"
            onClose={onClose}
            onBack={onBack}
            progress={{ current: 1, total: 3 }}
        >
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="flex flex-col">
                    <div className="space-y-4">
                        <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                            We built this to help you land the job, this makes it a little easier.
                        </h2>
                        <p className="text-[15px] font-medium text-slate-600">
                            We’ve been there and we’re here to help you.
                        </p>

                        {/* Offer card — single border, darker purple fill */}
                        <div className="rounded-2xl text-centered border border-violet-500 bg-violet-100 p-4">
                            <div className="text-[20px] text-center md:text-[22px] font-semibold text-slate-900">
                                Here’s{' '}
                                <span className="inline-block underline decoration-2 underline-offset-[3px]">
                                    $10 off
                                </span>{' '}
                                until you find a job.
                            </div>

                            {/* Price row */}
                            <div className="mt-2 flex justify-center items-baseline gap-3">
                                <div className="text-[22px] md:text-[24px] font-bold text-violet-700">
                                    {formatCents(offerCents)}
                                    <span className="ml-1 text-sm font-medium text-slate-500">/month</span>
                                </div>
                                <div className="text-sm text-slate-400 line-through">
                                    {formatCents(priceCents)}/month
                                </div>
                            </div>

                            {/* CTA inside the card */}
                            <button
                                onClick={onAccept}
                                className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600"
                            >
                                Get $10 off
                            </button>

                            <div className="mt-2 text-center text-[12px] italic text-slate-500">
                                You won’t be charged until your next billing date.
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="-mx-6 my-4 md:mx-0">
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* Secondary CTA pinned to bottom */}
                    <div className="mt-auto">
                        <button
                            onClick={onDecline}
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            No thanks
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
