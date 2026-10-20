import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { NoData, Pagination, Table, Tbody, Td, Tr, Button } from "notation-ui";
import { MdCheckCircle, MdCancel } from "react-icons/md";

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

            {/* Filter Pills */}
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-t-xl flex items-center gap-2 overflow-x-auto">
                <button
                    onClick={() => handleFilterStatus("")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        !currentStatus ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    All Proofs
                </button>
                <button
                    onClick={() => handleFilterStatus("pending")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'pending' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Pending Review
                </button>
                <button
                    onClick={() => handleFilterStatus("approved")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'approved' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Approved
                </button>
                <button
                    onClick={() => handleFilterStatus("rejected")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentStatus === 'rejected' ? 'bg-[#00C076] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Rejected
                </button>
            </div>

            {/* Submissions Table */}
            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Member", "Task", "Platform", "Reward", "Submitted Proof", "Status", "Actions"]}
                />

                <Tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.data.length > 0 ? (
                        submissions.data.map((sub) => (
                            <Tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <Td>
                                    <div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{sub.user?.name}</p>
                                        <p className="text-[11px] text-slate-500 font-mono">{sub.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                        {sub.task?.title || 'Micro Task'}
                                    </p>
                                </Td>
                                <Td>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                        {sub.task?.platform || 'Social'}
                                    </span>
                                </Td>
                                <Td className="font-bold text-xs text-emerald-600">
                                    ৳ {sub.reward_amount.toFixed(2)}
                                </Td>
                                <Td>
                                    <div className="max-w-xs">
                                        <p className="text-xs text-slate-700 dark:text-slate-300 break-words">
                                            {sub.proof_text || 'Completed'}
                                        </p>
                                        {sub.proof_image && (
                                            <a
                                                href={sub.proof_image}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-blue-600 font-bold hover:underline block mt-0.5"
                                            >
                                                View Attached Proof Image ↗
                                            </a>
                                        )}
                                    </div>
                                </Td>
                                <Td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {sub.status}
                                    </span>
                                    {sub.admin_notes && (
                                        <p className="text-[10px] text-slate-400 mt-0.5 italic">{sub.admin_notes}</p>
                                    )}
                                </Td>
                                <Td className="text-right">
                                    {sub.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleApprove(sub.id)}
                                                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                                title="Approve & Credit Balance"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => { setRejectingId(sub.id); setData('admin_notes', 'Proof does not match requirements'); }}
                                                className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                                title="Reject Submission"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">Processed</span>
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
                    onPageChange={(p) => router.get('/submissions', { page: p, status: currentStatus }, { preserveState: true })}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Reject Modal */}
            {rejectingId && (
                <Modal
                    open={Boolean(rejectingId)}
                    onClose={() => setRejectingId(null)}
                    title="Reject Task Submission"
                    onSave={handleReject}
                    loading={processing}
                    saveText="Confirm Rejection"
                >
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500">
                            Please provide a reason for rejecting this submission. The user's pending reward will be released.
                        </p>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Rejection Reason / Note
                            </label>
                            <textarea
                                value={data.admin_notes}
                                onChange={(e) => setData('admin_notes', e.target.value)}
                                rows={3}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium focus:outline-none"
                                placeholder="Explain why this proof was rejected..."
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </RootLayout>
    );
}
