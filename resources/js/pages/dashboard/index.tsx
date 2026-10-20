import RootLayout from "@/component/shared/RootLayout";
import PageHeader from "@/component/shared/PageHeader";
import StatCard from "@/component/shared/StatCard";
import AddButton from "@/component/shared/AddButton";
import { Link, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Button, Badge } from "notation-ui";
import { HiOutlineUserGroup, HiOutlineClock } from "react-icons/hi2";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { FaRegFolderOpen } from "react-icons/fa";
import { TbReceipt } from "react-icons/tb";

type DashboardProps = {
    stats: {
        totalUsers: number;
        totalTasks: number;
        pendingSubmissions: number;
        pendingWithdrawals: number;
        totalDistributed: number;
        totalCommissions: number;
        totalWithdrawn: number;
    };
    recentSubmissions: Array<{
        id: number;
        reward_amount: number;
        status: string;
        proof_text: string;
        created_at: string;
        user?: { name: string; email: string; user_code: string };
        task?: { title: string; platform: string };
    }>;
    recentWithdrawals: Array<{
        id: number;
        payout_type: string;
        account_number: string;
        amount: number;
        net_amount: number;
        status: string;
        created_at: string;
        user?: { name: string; user_code: string };
    }>;
    tierDistribution: Array<{
        id: number;
        name: string;
        price_text: string;
        users_count: number;
    }>;
};

export default function DashboardIndex({
    stats,
    recentSubmissions,
    recentWithdrawals,
    tierDistribution
}: DashboardProps) {
    const handleQuickApproveSubmission = (id: number) => {
        router.post(`/submissions/${id}/approve`, {}, {
            onSuccess: () => toast.success("Submission approved and user wallet credited!"),
        });
    };

    const handleQuickCompleteWithdrawal = (id: number) => {
        router.post(`/withdrawals/${id}/complete`, { transaction_reference: `DISB-${Date.now().toString().slice(-6)}` }, {
            onSuccess: () => toast.success("Withdrawal marked as disbursed!"),
        });
    };

    return (
        <RootLayout>
            <PageHeader
                title="Dashboard Overview"
                subtitle="Real-time financial performance, task completion velocity, and pending approvals."
                hasBack={false}
                buttons={[
                    <AddButton
                        key="create-task"
                        onClick={() => router.visit('/tasks')}
                    >
                        Create Task
                    </AddButton>,
                    <Button
                        key="payouts"
                        variant="primary"
                        styleType="outline"
                        className="flex items-center gap-2"
                        onClick={() => router.visit('/withdrawals')}
                    >
                        <MdOutlineAccountBalanceWallet />
                        Payouts ({stats.pendingWithdrawals})
                    </Button>
                ]}
            />

            {/* KPI Metric Cards matching notation-it StatCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard
                    Icon={HiOutlineUserGroup}
                    value={stats.totalUsers.toLocaleString()}
                    label="Active Members"
                    iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                />
                <StatCard
                    Icon={CiBoxList}
                    value={stats.totalTasks}
                    label="Active Tasks"
                    iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                />
                <StatCard
                    Icon={HiOutlineClock}
                    value={stats.pendingSubmissions}
                    label="Pending Proofs"
                    iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                />
                <StatCard
                    Icon={MdOutlineAccountBalanceWallet}
                    value={stats.pendingWithdrawals}
                    label="Pending Cashouts"
                    iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                />
            </div>

            {/* Financial Velocity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-foreground border p-4 rounded-md">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total Task Rewards Distributed
                    </span>
                    <h2 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                        ৳ {stats.totalDistributed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Credited to user wallets upon approved tasks
                    </p>
                </div>

                <div className="bg-foreground border p-4 rounded-md">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Multi-Level Commissions (L1-L3)
                    </span>
                    <h2 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                        ৳ {stats.totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Paid out to sponsors (12%, 5%, 2% network tiers)
                    </p>
                </div>

                <div className="bg-foreground border p-4 rounded-md">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Completed Cashouts Disbursed
                    </span>
                    <h2 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                        ৳ {stats.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        bKash, Nagad, and Bank transfer payouts
                    </p>
                </div>
            </div>

            {/* Two Column Layout: Recent Submissions & Pending Withdrawals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Pending Submissions Queue */}
                <div className="bg-foreground border p-4 rounded-md">
                    <div className="flex items-center justify-between pb-3 border-b mb-3">
                        <div className="flex items-center gap-2">
                            <FaRegFolderOpen className="text-secondary text-lg" />
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                Recent Task Submissions
                            </h2>
                        </div>
                        <Link href="/submissions" className="text-xs text-secondary hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-2.5">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="p-3 rounded-md border bg-background flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                            {sub.task?.title || 'Micro Task'}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            by <span className="font-medium text-slate-700 dark:text-slate-300">{sub.user?.name}</span> ({sub.user?.user_code})
                                        </p>
                                        <p className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5">
                                            Proof: {sub.proof_text}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-xs font-bold text-emerald-600">
                                            + ৳ {sub.reward_amount.toFixed(2)}
                                        </span>
                                        {sub.status === 'pending' ? (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => handleQuickApproveSubmission(sub.id)}
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <Badge
                                                variant={sub.status === 'approved' ? 'success' : sub.status === 'rejected' ? 'danger' : 'warning'}
                                                styleType="soft"
                                            >
                                                {sub.status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 py-6 text-center">No submissions yet.</p>
                        )}
                    </div>
                </div>

                {/* Pending Cashouts Queue */}
                <div className="bg-foreground border p-4 rounded-md">
                    <div className="flex items-center justify-between pb-3 border-b mb-3">
                        <div className="flex items-center gap-2">
                            <MdOutlineAccountBalanceWallet className="text-secondary text-lg" />
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                Cashout Requests
                            </h2>
                        </div>
                        <Link href="/withdrawals" className="text-xs text-secondary hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-2.5">
                        {recentWithdrawals.length > 0 ? (
                            recentWithdrawals.map((w) => (
                                <div
                                    key={w.id}
                                    className="p-3 rounded-md border bg-background flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-secondary" />
                                            {w.payout_type} • {w.account_number}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Member: <span className="font-medium text-slate-700 dark:text-slate-300">{w.user?.name}</span> ({w.user?.user_code})
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            ৳ {w.amount.toFixed(2)}
                                        </span>
                                        {w.status === 'pending' ? (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                styleType="outline"
                                                onClick={() => handleQuickCompleteWithdrawal(w.id)}
                                            >
                                                Disburse
                                            </Button>
                                        ) : (
                                            <Badge
                                                variant={w.status === 'completed' ? 'success' : w.status === 'rejected' ? 'danger' : 'warning'}
                                                styleType="soft"
                                            >
                                                {w.status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 py-6 text-center">No cashout requests yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Membership Tiers Distribution */}
            <div className="bg-foreground border p-4 rounded-md">
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        Membership Tiers Enrollment
                    </h2>
                    <Link href="/tiers" className="text-xs text-secondary hover:underline">
                        Configure Tiers →
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tierDistribution.map((t) => (
                        <div key={t.id} className="p-3.5 rounded-md border bg-background text-center">
                            <span className="text-xs font-medium text-gray-500">
                                {t.name}
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {t.users_count}
                            </h3>
                            <span className="text-[11px] text-secondary font-medium block mt-0.5">
                                {t.price_text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </RootLayout>
    );
}
