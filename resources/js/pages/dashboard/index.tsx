import RootLayout from "@/component/shared/RootLayout";
import PageHeader from "@/component/shared/PageHeader";
import { Link, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Button, Table, Tbody, Td, Th, Thead, Tr } from "notation-ui";
import { HiOutlineUserGroup, HiOutlineClock, HiOutlineCurrencyDollar } from "react-icons/hi2";
import { MdOutlineAccountBalanceWallet, MdCheckCircle, MdCancel } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { FaRegFolderOpen } from "react-icons/fa";

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
        badge_bg?: string;
        badge_text_color?: string;
    }>;
};

export default function DashboardIndex({ stats, recentSubmissions, recentWithdrawals, tierDistribution }: DashboardProps) {
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
                title="Money Machine Overview"
                subtitle="Real-time financial performance, task completion velocity, and pending approvals."
                hasBack={false}
                buttons={[
                    <Link
                        key="tasks"
                        href="/tasks"
                        className="px-4 py-2 text-xs font-bold bg-[#00C076] hover:bg-[#009E60] text-white rounded-xl shadow-sm transition-all"
                    >
                        + Create Task
                    </Link>,
                    <Link
                        key="withdrawals"
                        href="/withdrawals"
                        className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all"
                    >
                        Review Payouts ({stats.pendingWithdrawals})
                    </Link>
                ]}
            />

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Members</span>
                        <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <HiOutlineUserGroup className="text-xl" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.totalUsers.toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-bold">Growing</span> network tier tree
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Tasks</span>
                        <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <CiBoxList className="text-xl" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.totalTasks}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            YouTube, Facebook, Apps, TikTok, Surveys
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Proofs</span>
                        <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <HiOutlineClock className="text-xl" />
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <h3 className="text-2xl font-black text-amber-600">
                            {stats.pendingSubmissions}
                        </h3>
                        {stats.pendingSubmissions > 0 && (
                            <Link href="/submissions" className="text-xs text-amber-600 font-bold underline">
                                Action needed →
                            </Link>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Task submissions awaiting manual verification
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Cashouts</span>
                        <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <MdOutlineAccountBalanceWallet className="text-xl" />
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <h3 className="text-2xl font-black text-purple-600">
                            {stats.pendingWithdrawals}
                        </h3>
                        {stats.pendingWithdrawals > 0 && (
                            <Link href="/withdrawals" className="text-xs text-purple-600 font-bold underline">
                                Process now →
                            </Link>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        bKash, Nagad & Bank transfer queue
                    </p>
                </div>
            </div>

            {/* Financial Velocity Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm">
                    <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Total Rewards Distributed</span>
                    <h4 className="text-3xl font-black mt-2">
                        ৳ {stats.totalDistributed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-xs text-emerald-100 mt-1">
                        Direct task rewards paid to member wallets
                    </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-5 rounded-2xl shadow-sm">
                    <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Multi-Level Commissions Paid</span>
                    <h4 className="text-3xl font-black mt-2">
                        ৳ {stats.totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-xs text-indigo-100 mt-1">
                        L1 (12%), L2 (5%), L3 (2%) network incentives
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Completed Withdrawals</span>
                    <h4 className="text-3xl font-black mt-2">
                        ৳ {stats.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                        Disbursed to member mobile banking accounts
                    </p>
                </div>
            </div>

            {/* Two Column Layout: Recent Submissions & Pending Withdrawals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pending Submissions Queue */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FaRegFolderOpen className="text-emerald-500 text-lg" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Recent Task Submissions
                            </h2>
                        </div>
                        <Link href="/submissions" className="text-xs font-bold text-emerald-600 hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map((sub) => (
                                <div key={sub.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {sub.task?.title || 'Micro Task'}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            by <span className="font-semibold">{sub.user?.name}</span> ({sub.user?.user_code})
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                            Proof: {sub.proof_text}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-xs font-black text-emerald-600">
                                            + ৳ {sub.reward_amount.toFixed(2)}
                                        </span>
                                        {sub.status === 'pending' ? (
                                            <button
                                                onClick={() => handleQuickApproveSubmission(sub.id)}
                                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No submissions yet.</p>
                        )}
                    </div>
                </div>

                {/* Pending Cashouts Queue */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MdOutlineAccountBalanceWallet className="text-purple-500 text-lg" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Cashout Requests
                            </h2>
                        </div>
                        <Link href="/withdrawals" className="text-xs font-bold text-purple-600 hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentWithdrawals.length > 0 ? (
                            recentWithdrawals.map((w) => (
                                <div key={w.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                                            {w.payout_type} • {w.account_number}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Member: <span className="font-semibold">{w.user?.name}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            ৳ {w.amount.toFixed(2)}
                                        </span>
                                        {w.status === 'pending' ? (
                                            <button
                                                onClick={() => handleQuickCompleteWithdrawal(w.id)}
                                                className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm cursor-pointer transition-all"
                                            >
                                                Mark Disbursed
                                            </button>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {w.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No cashout requests yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Membership Tiers Distribution */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Membership Tiers Enrollment
                    </h2>
                    <Link href="/tiers" className="text-xs font-bold text-emerald-600 hover:underline">
                        Configure Tiers →
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {tierDistribution.map((t) => (
                        <div key={t.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {t.name}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                {t.users_count}
                            </h3>
                            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                {t.price_text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </RootLayout>
    );
}
