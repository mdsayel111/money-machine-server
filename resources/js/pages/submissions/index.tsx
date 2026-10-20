import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Badge, Button, NoData, Pagination, Table, Tbody, Td, Tr } from "notation-ui";

type SubmissionItem = {
    id: number;
    reward_amount: number;
    proof_text?: string;
    proof_image?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
    user?: { id: number; name: string; user_code: string; email: string };
    task?: { id: number; title: string; platform: string };
    reviewer?: { name: string };
};

export default function SubmissionsIndex({
    submissions,
    currentStatus
}: {
    submissions: TPagination<SubmissionItem>;
    currentStatus?: string;
}) {
    const [page, setPage] = useState(submissions.current_page);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        admin_notes: "",
    });

    const handleFilterStatus = (status: string) => {
        router.get('/submissions', { status: status || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleApprove = (id: number) => {
        if (confirm("Approve this task proof? This will instantly credit the member's wallet and distribute multi-level referral commissions.")) {
            router.post(`/submissions/${id}/approve`, {}, {
                onSuccess: () => toast.success("Submission approved! Reward and referral commissions credited."),
                onError: () => toast.error("Could not approve submission."),
            });
        }
    };

    const handleReject = () => {
        if (!rejectingId) return;
        post(`/submissions/${rejectingId}/reject`, {
            onSuccess: () => {
                toast.success("Submission rejected.");
                setRejectingId(null);
                reset();
            },
            onError: () => toast.error("Could not reject submission."),
        });
    };

    return (
        <RootLayout>
            <PageHeader
                title="Task Submissions"
                subtitle="Review proof submitted by members, approve payout rewards, and trigger downline commissions."
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
                    All Proofs
                </Button>
                <Button
                    variant={currentStatus === 'pending' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'pending' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("pending")}
                >
                    Pending Review
                </Button>
                <Button
                    variant={currentStatus === 'approved' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'approved' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("approved")}
                >
                    Approved
                </Button>
                <Button
                    variant={currentStatus === 'rejected' ? 'primary' : 'secondary'}
                    styleType={currentStatus === 'rejected' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterStatus("rejected")}
                >
                    Rejected
                </Button>
            </div>

            {/* Submissions Table */}
            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Member", "Task", "Platform", "Reward", "Submitted Proof", "Status", "Action"]}
                />

                <Tbody className="bg-white dark:bg-background">
                    {submissions.data.length > 0 ? (
                        submissions.data.map((sub) => (
                            <Tr key={sub.id}>
                                <Td>
                                    <div>
                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{sub.user?.name}</p>
                                        <p className="text-[11px] text-gray-500 font-mono">{sub.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="font-medium text-xs text-slate-800 dark:text-slate-200">
                                        {sub.task?.title || 'Micro Task'}
                                    </p>
                                </Td>
                                <Td>
                                    <span className="text-xs uppercase font-medium text-gray-500">
                                        {sub.task?.platform || 'Social'}
                                    </span>
                                </Td>
                                <Td className="font-semibold text-xs text-emerald-600">
                                    ৳ {sub.reward_amount.toFixed(2)}
                                </Td>
                                <Td>
                                    <div className="max-w-xs">
                                        <p className="text-xs text-gray-700 dark:text-gray-300 break-words">
                                            {sub.proof_text || 'Completed'}
                                        </p>
                                        {sub.proof_image && (
                                            <a
                                                href={sub.proof_image}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-blue-500 font-medium hover:underline block mt-0.5"
                                            >
                                                View Attached Proof Image ↗
                                            </a>
                                        )}
                                    </div>
                                </Td>
                                <Td>
                                    <Badge
                                        variant={sub.status === 'approved' ? 'success' : sub.status === 'rejected' ? 'danger' : 'warning'}
                                        styleType="soft"
                                    >
                                        {sub.status}
                                    </Badge>
                                    {sub.admin_notes && (
                                        <p className="text-[10px] text-gray-400 mt-0.5 italic">{sub.admin_notes}</p>
                                    )}
                                </Td>
                                <Td className="text-right">
                                    {sub.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => handleApprove(sub.id)}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => {
                                                    setRejectingId(sub.id);
                                                    setData('admin_notes', 'Proof does not match requirements');
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
                    currentPage={submissions.current_page}
                    totalPages={submissions.last_page}
                    onPageChange={setPage}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Rejection Modal */}
            <Modal
                open={rejectingId !== null}
                onClose={() => setRejectingId(null)}
                title="Reject Task Submission"
                onSave={handleReject}
                saveText="Confirm Rejection"
            >
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Please provide a reason for rejection. This explanation will be visible to the user in their task activity ledger.
                    </p>
                    <textarea
                        value={data.admin_notes}
                        onChange={(e) => setData('admin_notes', e.target.value)}
                        rows={3}
                        className="w-full text-xs bg-foreground border p-3 rounded-md font-medium focus:outline-none"
                        placeholder="Reason for rejecting submission..."
                    />
                </div>
            </Modal>
        </RootLayout>
    );
}
