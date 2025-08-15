'use client';

import clsx from 'clsx';

export default function StepDots({
    current,
    total,
    className,
}: {
    current: number;
    total: number;
    className?: string;
}) {
    // Render N rounded bars; bars <= current are “active”
    return (
        <div
            className={clsx('flex items-center gap-1.5', className)}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={current}
            aria-label={`Step ${current} of ${total}`}
        >
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={clsx(
                        'h-1.5 w-6 rounded-full transition-colors duration-300',
                        i < current ? 'bg-emerald-500' : 'bg-slate-300/60'
                    )}
                />
            ))}
        </div>
    );
}
