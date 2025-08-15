// ReasonModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import BaseModal from './BaseModal';
import { formatCents } from './format';

const HERO_SRC = '/empire-state.jpg';

type ReasonKey = 'too_expensive' | 'not_helpful' | 'not_enough' | 'not_moving' | 'other';

const LABELS: Record<ReasonKey, string> = {
    too_expensive: 'Too expensive',
    not_helpful: 'Platform not helpful',
    not_enough: 'Not enough relevant jobs',
    not_moving: 'Decided not to move',
    other: 'Other',
};

const PROMPTS: Partial<Record<ReasonKey, string>> = {
    not_helpful: 'What can we change to make the platform more helpful?*',
    not_enough: 'In which way can we make the jobs more relevant?*',
    not_moving: 'What changed for you to decide to not move?*',
    other: 'What would have helped you the most?*',
};

export default function CancelReasonModal({
    open,
    onClose,
    onBack,
    priceCents,
    offerCents,
    onAcceptOffer,
    onComplete,
    stepCurrent,
    stepTotal,
}: {
    open: boolean;
    onClose: () => void;
    onBack?: () => void;
    priceCents: number;
    offerCents: number | null;
    onAcceptOffer: () => void;
    onComplete: (payload: { type: ReasonKey; text?: string }) => void;
    stepCurrent: number;
    stepTotal: number;
}) {
    const [selected, setSelected] = useState<ReasonKey | null>(null);
    const [text, setText] = useState('');
    const [price, setPrice] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    // reset when reopened
    useEffect(() => {
        if (!open) {
            setSelected(null);
            setText('');
            setPrice('');
            setShowErrors(false);
        }
    }, [open]);

    const offer = useMemo(
        () => formatCents(offerCents ?? Math.max(0, priceCents - 1000)),
        [offerCents, priceCents]
    );

    // validation
    const needsTextarea = selected && selected !== 'too_expensive';
    const textareaValid = !needsTextarea || text.trim().length >= 25;
    const optionChosen = !!selected;
    const formValid = optionChosen && (selected === 'too_expensive' ? true : textareaValid);

    const submit = () => {
        if (!optionChosen || !textareaValid) {
            setShowErrors(true);
            return;
        }
        onComplete(
            selected === 'too_expensive'
                ? { type: selected, text: price.trim() }
                : { type: selected, text: text.trim() }
        );
    };

    return (
        <BaseModal
            open={open}
            title="Subscription Cancellation"
            onClose={onClose}
            onBack={onBack}
            progress={{ current: stepCurrent, total: stepTotal }}
        >
            <div className="grid gap-8 px-6 pb-6 pt-6 md:grid-cols-[1fr_440px] md:gap-10 md:px-8 md:pb-8">
                {/* LEFT */}
                <div className="space-y-5">
                    <h2 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] text-slate-900">
                        What’s the main reason{selected ? '' : ' for cancelling'}?
                    </h2>
                    <p className="text-slate-600 -mt-1">Please take a minute to let us know why:</p>

                    {/* top-of-form error when nothing chosen */}
                    {showErrors && !optionChosen && (
                        <div className="text-[13px] leading-5 text-red-600">
                            To help us understand your experience, please select a reason for cancelling<span className="ml-0.5">*</span>
                        </div>
                    )}

                    {/* options list (collapses to only the selected row once chosen) */}
                    <div className="space-y-3">
                        {(selected ? [selected] : (Object.keys(LABELS) as ReasonKey[])).map((key) => (
                            <label
                                key={key}
                                className="flex items-center gap-3 rounded-lg px-1 py-1"
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    className="h-4 w-4 accent-slate-700"
                                    checked={selected === key}
                                    onChange={() => setSelected(key)}
                                />
                                <span className="text-[15px] text-slate-800">{LABELS[key]}</span>
                            </label>
                        ))}
                    </div>

                    {/* detail input for chosen option */}
                    {selected && (
                        <div className="mt-1">
                            {selected === 'too_expensive' ? (
                                <div className="max-w-[540px]">
                                    <label className="block text-[14px] font-medium text-slate-700 mb-2">
                                        What would be the maximum you would be willing to pay?
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                        <input
                                            inputMode="decimal"
                                            className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8952fc]/30"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[620px]">
                                    <label className="block text-[14px] font-medium text-slate-700 mb-2">
                                        {PROMPTS[selected]}
                                    </label>

                                    {/* inline error + counter */}
                                    {!textareaValid && showErrors && (
                                        <div className="mb-2 text-[13px] text-red-600">
                                            Please enter at least 25 characters so we can understand your feedback<span className="ml-0.5">*</span>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <textarea
                                            rows={4}
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Enter reason here..."
                                            className={[
                                                'w-full rounded-lg border bg-white px-3 py-2.5 outline-none resize-y',
                                                textareaValid
                                                    ? 'border-slate-300 focus:ring-2 focus:ring-[#8952fc]/30'
                                                    : 'border-red-400 focus:ring-2 focus:ring-red-200',
                                            ].join(' ')}
                                        />
                                        <div
                                            className={[
                                                'absolute bottom-2 right-3 text-[11px]',
                                                textareaValid ? 'text-slate-400' : 'text-red-600',
                                            ].join(' ')}
                                        >
                                            Min 25 characters ({text.trim().length}/25)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* divider */}
                    <div className="-mx-6 my-1 md:mx-0">
                        <div className="block h-[10px] w-full border-t border-slate-200 bg-gradient-to-b from-slate-200/60 to-transparent md:hidden" />
                        <div className="hidden h-px w-full bg-slate-200 md:block" />
                    </div>

                    {/* CTA row */}
                    <div className="space-y-3">
                        <button
                            onClick={onAcceptOffer}
                            className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
                        >
                            Get 50% off | {offer}
                            <span className="ml-2 text-sm text-slate-300 line-through">
                                {formatCents(priceCents)}
                            </span>
                        </button>

                        <button
                            onClick={submit}
                            className={[
                                'w-full rounded-xl py-3 font-medium',
                                formValid
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-slate-100 text-slate-400',
                            ].join(' ')}
                        >
                            Complete cancellation
                        </button>
                    </div>
                </div>

                {/* RIGHT image */}
                <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 md:block">
                    <div className="relative h-[360px] w-full">
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
