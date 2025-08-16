'use client';

import Image from 'next/image';
import BaseModal from '../BaseModal';

const HERO_SRC = '/empire-state.jpg';

export default function AcceptedModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <BaseModal open={open} title="Subscription Continued" onClose={onClose}>
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                <div className="space-y-3">
                    <h2 className="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
                        Great choice, mate!
                    </h2>
                    <p className="text-slate-600">
                        You’re still on the path to your dream role. Let’s make it happen together!
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#8952fc] py-3 font-medium text-white hover:brightness-105"
                    >
                        Land your dream role
                    </button>
                </div>
                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-full min-h-[220px] w-full">
                        <Image src={HERO_SRC} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
