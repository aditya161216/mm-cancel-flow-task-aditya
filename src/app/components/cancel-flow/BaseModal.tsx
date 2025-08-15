'use client';

import React from 'react';
import StepDots from './StepDots';

export default function BaseModal({
    open,
    title,
    onClose,
    children,
    progress,
    onBack,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    progress?: { current: number; total: number };
    onBack?: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                className="relative w-full max-w-[980px] rounded-[18px] bg-white shadow-2xl ring-1 ring-black/5"
                role="dialog"
                aria-modal="true"
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                tabIndex={-1}
            >
                {/* MOBILE HEADER: Back, Title, Stepper all on the left; Close on the right */}
                <div className="md:hidden px-4 pt-2 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {onBack && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="inline-flex items-center gap-1 text-[14px] text-slate-600 hover:text-slate-800"
                                    aria-label="Back"
                                >
                                    <span className="-ml-1 text-[18px]">‹</span> Back
                                </button>
                            )}

                            <div className="mt-1 text-[14px] font-semibold tracking-normal text-slate-600">
                                {title}
                            </div>

                            {progress && (
                                <div className="mt-1 flex items-center gap-2">
                                    <StepDots current={progress.current} total={progress.total} />
                                    <span className="text-[12px] text-slate-400">
                                        Step {progress.current} of {progress.total}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full
                         text-slate-400 hover:text-slate-400 hover:bg-slate-50
                         text-[28px] leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* DESKTOP/TABLET HEADER: centered title, dots to the right */}
                <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
                    <div className="justify-self-start">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="inline-flex items-center gap-1 text-[14px] text-slate-600 hover:text-slate-800"
                                aria-label="Back"
                            >
                                <span className="-ml-1 text-[18px]">‹</span> Back
                            </button>
                        )}
                    </div>

                    <div className="justify-self-center">
                        <div className="mx-auto flex items-center gap-3 text-[14px] font-semibold tracking-normal text-slate-600">
                            <span className="whitespace-nowrap">{title}</span>
                            {progress && (
                                <div className="flex items-center gap-2">
                                    <StepDots current={progress.current} total={progress.total} />
                                    <span className="text-[12px] font-normal text-slate-400">
                                        Step {progress.current} of {progress.total}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="justify-self-end">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="inline-flex items-center justify-center
                         h-8 w-8 rounded-full
                         text-slate-400 hover:text-slate-400 hover:bg-slate-50
                         text-[20px] leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-200/70" />

                {children}
            </div>
        </div>
    );
}
