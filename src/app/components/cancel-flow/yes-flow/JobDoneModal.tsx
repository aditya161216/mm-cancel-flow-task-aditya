'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';
const avatarSrc = '/mihailo-profile.jpeg';

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
            progress={{ current: 3, total: 3, done: true }}
        >
            <div className="grid items-stretch gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="flex flex-col">
                    {/* Mobile hero only when no visa help is needed */}
                    {!needsVisaHelp && (
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
                    )}

                    <div className="space-y-4">
                        {needsVisaHelp ? (
                            <>
                                <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                                    Your cancellation’s all sorted, mate, no more charges.
                                </h2>

                                {/* Mihailo card */}
                                <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={avatarSrc}
                                            alt="Mihailo Bozic"
                                            width={36}
                                            height={36}
                                            className="h-9 w-9 rounded-full object-cover"
                                            priority
                                        />
                                        <div className="leading-tight">
                                            <div className="text-[13px] font-medium text-slate-800">Mihailo Bozic</div>
                                            <a
                                                href="mailto:mihailo@migratemate.co"
                                                className="text-[12px] text-slate-500 hover:underline"
                                            >
                                                {'<mihailo@migratemate.co>'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2 text-[13px] leading-6 text-slate-700">
                                        <p className="font-semibold">I’ll be reaching out soon to help with the visa side of things.</p>
                                        <p>We’ve got your back, whether it’s questions, paperwork, or just figuring out your options.</p>
                                        <p>
                                            Keep an eye on your inbox, I’ll be in touch <span className="underline">shortly</span>.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                                    All done, your cancellation’s been processed.
                                </h2>
                                <p className="text-[15px] text-slate-700 font-semibold">
                                    We’re stoked to hear you’ve landed a job and sorted your visa. Big congrats from the team.🙌
                                </p>
                            </>
                        )}
                    </div>

                    {/* divider */}
                    <div className="-mx-6 my-4 md:mx-0">
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA pinned bottom-left */}
                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-[#8b5cf6] py-3 font-semibold text-white hover:bg-[#7c4cf4]"
                        >
                            Finish
                        </button>
                    </div>
                </div>

                {/* RIGHT image fills column height (md+) */}
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
