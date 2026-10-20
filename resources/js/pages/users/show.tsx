import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import { Link } from "@inertiajs/react";
import { Table, Tbody, Td, Th, Thead, Tr } from "notation-ui";
import { HiOutlineUserGroup, HiOutlineCurrencyDollar } from "react-icons/hi2";
import { FaRegFolderOpen } from "react-icons/fa";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

type UserDetailProps = {
    user: {
        id: number;
        name: string;
        email: string;
        user_code: string;
        phone?: string;
        avatar_url?: string;
        tier_level: string;
        available_balance: number;
        today_earnings: number;
        pending_rewards: number;
        lifetime_earnings: number;
        level: number;
        level_progress: number;
        referral_code: string;
        is_active: boolean;
        created_at: string;
        referrer?: { name: string; user_code: string };
        direct_referrals: Array<{
            id: number;
            name: string;
            user_code: string;
            tier_level: string;
            available_balance: number;
            created_at: string;
        }>;
        transactions: Array<{
            id: number;
            title: string;
            subtitle?: string;
            amount: number;
            is_positive: boolean;
            type: string;
            created_at: string;
        }>;
        task_submissions: Array<{
            id: number;
            reward_amount: number;
            status: string;
            created_at: string;
            task?: { title: string; platform: string };
        }>;
    };
    tiers: Array<{ id: number; name: string }>;
};

export default function UserShow({ user }: UserDetailProps) {
    return (
        <RootLayout>
            <PageHeader
                title={`${user.name} (${user.user_code || `ID: ${user.id}`})`}
                subtitle="Complete member profile, multi-level downline referrals, and wallet activity ledger."
                hasBack={true}
            />

            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
                    <h3 className="text-2xl font-black text-emerald-600 mt-2">
                        ৳ {user.available_balance.toFixed(2)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Pending: ৳ {user.pending_rewards.toFixed(2)}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Membership Tier</span>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                            {user.tier_level}
                        </span>
                        <span className="text-xs text-slate-500">Level {user.level} ({user.level_progress}%)</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Direct Referrals (L1)</span>
                    <h3 className="text-2xl font-black text-indigo-600 mt-2">
                        {user.direct_referrals.length}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Ref Code: {user.referral_code}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lifetime Earnings</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        ৳ {user.lifetime_earnings.toFixed(2)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Sponsor: {user.referrer ? user.referrer.name : 'Direct Root'}</p>
                </div>
            </div>

            {/* Direct Referrals (L1) Downline */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <HiOutlineUserGroup className="text-indigo-500 text-lg" />
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Direct Downline Referrals ({user.direct_referrals.length})
                        </h2>
                    </div>
                </div>

                {user.direct_referrals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                                    <th className="py-2.5">Member</th>
                                    <th className="py-2.5">Code</th>
                                    <th className="py-2.5">Tier</th>
                                    <th className="py-2.5">Balance</th>
                                    <th className="py-2.5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {user.direct_referrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">{ref.name}</td>
                                        <td className="py-2.5 font-mono text-slate-500">{ref.user_code}</td>
                                        <td className="py-2.5">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                                {ref.tier_level}
                                            </span>
                                        </td>
                                        <td className="py-2.5 font-bold text-emerald-600">৳ {ref.available_balance.toFixed(2)}</td>
                                        <td className="py-2.5">
                                            <Link href={`/users/${ref.id}`} className="text-indigo-600 font-bold hover:underline">
                                                Inspect →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No direct referrals yet.</p>
                )}
            </div>

            {/* Transactions History */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <MdOutlineAccountBalanceWallet className="text-emerald-500 text-lg" />
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Recent Ledger Transactions
                    </h2>
                </div>

                <div className="space-y-2.5">
                    {user.transactions && user.transactions.length > 0 ? (
                        user.transactions.map((tx) => (
                            <div key={tx.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{tx.title}</p>
                                    <p className="text-[11px] text-slate-500">{tx.subtitle || tx.type}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`font-black ${tx.is_positive ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                        {tx.is_positive ? '+ ' : '- '} ৳ {tx.amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded yet.</p>
                    )}
                </div>
            </div>
        </RootLayout>
    );
}
