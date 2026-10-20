import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Badge, Button, Input, NoData, Pagination, Table, Tbody, Td, Tr } from "notation-ui";

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

            {/* Filter Buttons */}
            <div className="bg-foreground p-4 border-x border-t rounded-t-lg flex items-center gap-2 overflow-x-auto">
                <Button
                    variant={!currentStatus ? 'primary' : 'secondary'}
                    styleType={!currentStatus ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("")}
                >
                    All Payouts
                </Button>
                <Button
                    variant={currentStatus === 'pending' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'pending' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("pending")}
                >
                    Pending Queue
                </Button>
                <Button
                    variant={currentStatus === 'completed' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'completed' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("completed")}
                >
                    Completed
                </Button>
                <Button
                    variant={currentStatus === 'rejected' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'rejected' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("rejected")}
                >
                    Rejected / Refunded
                </Button>
            </div>

            {/* Table */}
            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Member", "Method", "Account Number", "Gross", "Fee", "Net Payable", "Status", "Reference", "Action"]}
                />

                <Tbody className="bg-white dark:bg-background">
                    {withdrawals.data.length > 0 ? (
                        withdrawals.data.map((w) => (
                            <Tr key={w.id}>
                                <Td>
                                    <div>
                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{w.user?.name}</p>
                                        <p className="text-[11px] text-gray-500 font-mono">{w.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <span className="text-xs uppercase font-medium text-gray-700 dark:text-gray-300">
                                        {w.payout_type}
                                    </span>
                                </Td>
                                <Td className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    {w.account_number}
                                </Td>
                                <Td className="text-xs text-gray-600 font-medium">
                                    ৳ {w.amount.toFixed(2)}
                                </Td>
                                <Td className="text-xs text-red-500 font-medium">
                                    - ৳ {w.fee.toFixed(2)}
                                </Td>
                                <Td className="font-semibold text-xs text-emerald-600">
                                    ৳ {w.net_amount.toFixed(2)}
                                </Td>
                                <Td>
                                    <Badge
                                        variant={w.status === 'completed' ? 'success' : w.status === 'rejected' ? 'danger' : 'warning'}
                                        styleType="soft"
                                    >
                                        {w.status}
                                    </Badge>
                                </Td>
                                <Td className="font-mono text-[11px] text-gray-500">
                                    {w.transaction_reference || '—'}
                                </Td>
                                <Td className="text-right">
                                    {w.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => {
                                                    setCompletingId(w.id);
                                                    completeForm.setData('transaction_reference', `${w.payout_type.toUpperCase()}-${Date.now().toString().slice(-6)}`);
                                                }}
                                            >
                                                Disburse
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => {
                                                    setRejectingId(w.id);
                                                    rejectForm.setData('admin_notes', 'Invalid account number');
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Processed</span>
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
                    onPageChange={(page) => router.get('/withdrawals', { page, status: currentStatus || undefined })}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Complete Payout Modal */}
            <Modal
                open={completingId !== null}
                onClose={() => setCompletingId(null)}
                title="Mark Withdrawal as Disbursed"
                onSave={handleConfirmComplete}
                saveText="Confirm Disbursal"
            >
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Enter the transaction ID or merchant disbursement reference received from your payment gateway.
                    </p>
                    <Input
                        label="Gateway Transaction ID / TrxID"
                        value={completeForm.data.transaction_reference}
                        onChange={(e) => completeForm.setData('transaction_reference', e.target.value)}
                        placeholder="e.g. BKASH-89X7712 or NAGAD-1234"
                    />
                    <Input
                        label="Disbursement Notes"
                        value={completeForm.data.admin_notes}
                        onChange={(e) => completeForm.setData('admin_notes', e.target.value)}
                        placeholder="Disbursed via merchant..."
                    />
                </div>
            </Modal>

            {/* Reject & Refund Payout Modal */}
            <Modal
                open={rejectingId !== null}
                onClose={() => setRejectingId(null)}
                title="Reject Withdrawal & Refund Funds"
                onSave={handleConfirmReject}
                saveText="Confirm Refund"
            >
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Rejecting this cashout will automatically credit the requested amount back to the member's wallet balance.
                    </p>
                    <Input
                        label="Reason for Rejection"
                        value={rejectForm.data.admin_notes}
                        onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                        placeholder="e.g. Account not registered or personal limit exceeded..."
                    />
                </div>
            </Modal>
        </RootLayout>
    );
}
