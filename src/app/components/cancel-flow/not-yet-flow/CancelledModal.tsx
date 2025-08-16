'use client';

import { useEffect } from 'react';
import BaseModal from '../BaseModal';

export default function CancelledModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {



    useEffect(() => {
        console.log("Cancelled modal")
    })



    return (
        <BaseModal open={open} title="Subscription Cancellation" onClose={onClose}>
            <div className="space-y-3 p-10 text-center">
                <h3 className="text-xl font-semibold">All set</h3>
                <p className="text-slate-600">
                    We’ve saved your choice. You can close this window.
                </p>
                <button
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
                >
                    Close
                </button>
            </div>
        </BaseModal>
    );
}
