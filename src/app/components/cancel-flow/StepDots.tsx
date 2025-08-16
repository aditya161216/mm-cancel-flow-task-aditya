'use client';

import clsx from 'clsx';

type StepDotsProps = {
    current: number;     // 1-based index of current step
    total: number;
    done?: boolean;      // when true, show all green (final modal)
    className?: string;
};

export default function StepDots({
    current,
    total,
    done = false,
    className,
}: StepDotsProps) {
    // Clamp current to [1, total] for safety
    const curr = Math.min(Math.max(current, 1), Math.max(total, 1));

    return (
        <div
            className={clsx('flex items-center gap-1.5', className)}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={done ? total : curr}
            aria-label={done ? 'Completed' : `Step ${curr} of ${total}`}
        >
            {Array.from({ length: total }).map((_, i) => {
                if (done) return <span key={i} className="h-1.5 w-6 rounded-full bg-emerald-500" />;
                const idx = i + 1; // 1-based
                const isCompleted = idx < curr;
                const isCurrent = idx === curr;
                const cls = isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                        ? 'bg-slate-400'
                        : 'bg-slate-200';
                return <span key={i} className={clsx('h-1.5 w-6 rounded-full transition-colors', cls)} />;
            })}
        </div>
    );
}
