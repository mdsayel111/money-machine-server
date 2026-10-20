import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { NoData, Pagination, Table, Tbody, Td, Tr, Input } from "notation-ui";

type WithdrawalItem = {
    id: number;
    payout_type: string;
    account_number: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    transaction_reference?: string;
    admin_notes?: string;
    created_at: string;
    user?: { id: number; name: string; user_code: string; email: string };
    processor?: { name: string };
};

export default function WithdrawalsIndex({
    withdrawals,
    currentStatus
}: {
    withdrawals: TPagination<WithdrawalItem>;
    currentStatus?: string;
}) {
    const [completingId, setCompletingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const completeForm = useForm({
        transaction_reference: `BKASH-${Date.now().toString().slice(-6)}`,
        admin_notes: "Disbursed via official merchant account.",
    });

    const rejectForm = useForm({
        admin_notes: "Account number invalid or inactive.",
    });

    const handleFilterStatus = (status: string) => {
        router.get('/withdrawals', { status: status || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleConfirmComplete = () => {
        if (!completingId) return;
        completeForm.post(`/withdrawals/${completingId}/complete`, {
            onSuccess: () => {
                toast.success("Withdrawal marked as completed!");
                setCompletingId(null);
            },
            onError: () => toast.error("Could not complete withdrawal."),
        });
    };

    const handleConfirmReject = () => {
        if (!rejectingId) return;
        rejectForm.post(`/withdrawals/${rejectingId}/reject`, {
            onSuccess: () => {
                toast.success("Withdrawal rejected and funds refunded to member's balance!");
                setRejectingId(null);
            },
            onError: () => toast.error("Could not reject withdrawal."),
        });
    };

    return (
        <RootLayout>
            <PageHeader
                title="Withdrawal Requests"
                subtitle="Execute member payouts, disburse funds via bKash/Nagad/Bank, and manage automatic refunds."
                hasBack={false}
            />

            {/* Filter Pills */}
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-t-xl flex items-center gap-2 overflow-x-auto">
                <button
                    onClick={() => handleFilterStatus("")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        !currentStatus ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    All Payouts
                </button>
                <button
                    onClick={() => handleFilterStatus("pending")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'pending' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Pending Queue
                </button>
                <button
                    onClick={() => handleFilterStatus("completed")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'completed' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Completed
                </button>
                <button
                    onClick={() => handleFilterStatus("rejected")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'rejected' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Rejected / Refunded
                </button>
            </div>

            {/* Table */}
            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Member", "Method", "Account Number", "Gross", "Fee", "Net Payable", "Status", "Reference", "Actions"]}
                />

                <Tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {withdrawals.data.length > 0 ? (
                        withdrawals.data.map((w) => (
                            <Tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <Td>
                                    <div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{w.user?.name}</p>
                                        <p className="text-[11px] text-slate-500 font-mono">{w.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-100">
                                        {w.payout_type}
                                    </span>
                                </Td>
                                <Td className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {w.account_number}
                                </Td>
                                <Td className="text-xs text-slate-600 font-semibold">
                                    ৳ {w.amount.toFixed(2)}
                                </Td>
                                <Td className="text-xs text-red-500 font-semibold">
                                    - ৳ {w.fee.toFixed(2)}
                                </Td>
                                <Td className="font-black text-xs text-emerald-600">
                                    ৳ {w.net_amount.toFixed(2)}
                                </Td>
                                <Td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-purple-100 text-purple-700'
                                    }`}>
                                        {w.status}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] text-slate-500">
                                    {w.transaction_reference || '—'}
                                </Td>
                                <Td className="text-right">
                                    {w.status === 'pending' || w.status === 'processing' ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setCompletingId(w.id);
                                                    completeForm.setData('transaction_reference', `${w.payout_type.toUpperCase()}-${Date.now().toString().slice(-6)}`);
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                                title="Mark as Disbursed"
                                            >
                                                Disburse
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(w.id)}
                                                className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                                title="Reject & Refund Member Balance"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">Archived</span>
                                    )}
                                </Td>
                            </Tr>
                        ))
                    ) : (
                        <NoData />
                    )}
                </Tbody>
            </Table>

            <div className="mx-2 mb-8">
                <Pagination
                    currentPage={withdrawals.current_page}
                    totalPages={withdrawals.last_page}
                    onPageChange={(p) => router.get('/withdrawals', { page: p, status: currentStatus }, { preserveState: true })}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Complete Disbursement Modal */}
            {completingId && (
                <Modal
                    open={Boolean(completingId)}
                    onClose={() => setCompletingId(null)}
                    title="Confirm Cashout Disbursement"
                    onSave={handleConfirmComplete}
                    loading={completeForm.processing}
                    saveText="Confirm Disbursed"
                >
                    <div className="space-y-3.5">
                        <Input
                            label="Transaction Reference / TrxID"
                            value={completeForm.data.transaction_reference}
                            onChange={(e) => completeForm.setData('transaction_reference', e.target.value)}
                            placeholder="e.g. 9J28DA1092"
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Disbursement Note
                            </label>
                            <Input
                                value={completeForm.data.admin_notes}
                                onChange={(e) => completeForm.setData('admin_notes', e.target.value)}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reject & Refund Modal */}
            {rejectingId && (
                <Modal
                    open={Boolean(rejectingId)}
                    onClose={() => setRejectingId(null)}
                    title="Reject Withdrawal & Refund Balance"
                    onSave={handleConfirmReject}
                    loading={rejectForm.processing}
                    saveText="Reject & Refund"
                >
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500">
                            Rejecting this withdrawal will immediately refund the gross amount back into the member's wallet.
                        </p>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectForm.data.admin_notes}
                                onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                rows={3}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium focus:outline-none"
                                placeholder="Explain why payout was rejected..."
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </RootLayout>
    );
}
