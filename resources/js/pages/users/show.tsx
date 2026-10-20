import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import StatCard from "@/component/shared/StatCard";
import TableHeader from "@/component/shared/TableHeader";
import { router } from "@inertiajs/react";
import { Button, Table, Tbody, Td, Tr, NoData } from "notation-ui";
import { HiOutlineUserGroup, HiOutlineCurrencyDollar } from "react-icons/hi2";
import { MdOutlineAccountBalanceWallet, MdOutlineStars } from "react-icons/md";

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

            {/* Top Overview Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard
                    Icon={MdOutlineAccountBalanceWallet}
                    value={`৳ ${user.available_balance.toFixed(2)}`}
                    label="Available Balance"
                    iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                />

                <StatCard
                    Icon={MdOutlineStars}
                    value={user.tier_level}
                    label="Membership Tier"
                    iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                />

                <StatCard
                    Icon={HiOutlineUserGroup}
                    value={user.direct_referrals.length}
                    label="Direct Referrals (L1)"
                    iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                />

                <StatCard
                    Icon={HiOutlineCurrencyDollar}
                    value={`৳ ${user.lifetime_earnings.toFixed(2)}`}
                    label="Lifetime Earnings"
                    iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                />
            </div>

            {/* Direct Referrals (L1) Downline */}
            <div className="bg-foreground border p-4 rounded-md mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <HiOutlineUserGroup className="text-secondary text-lg" />
                    <h2 className="text-base font-semibold">
                        Direct Downline Referrals ({user.direct_referrals.length})
                    </h2>
                </div>

                {user.direct_referrals.length > 0 ? (
                    <Table tableStyle="border" className="mb-0">
                        <TableHeader items={["Member", "Code", "Tier", "Balance", "Action"]} />
                        <Tbody className="bg-white dark:bg-background">
                            {user.direct_referrals.map((ref) => (
                                <Tr key={ref.id}>
                                    <Td className="font-semibold text-xs">{ref.name}</Td>
                                    <Td className="font-mono text-xs text-gray-500">{ref.user_code}</Td>
                                    <Td className="font-semibold text-xs">{ref.tier_level}</Td>
                                    <Td className="font-bold text-xs text-secondary">৳ {ref.available_balance.toFixed(2)}</Td>
                                    <Td className="text-right">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            styleType="outline"
                                            onClick={() => router.visit(`/users/${ref.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                ) : (
                    <p className="text-xs text-gray-400 py-4 text-center">No direct referrals yet.</p>
                )}
            </div>

            {/* Transactions History */}
            <div className="bg-foreground border p-4 rounded-md">
                <div className="flex items-center gap-2 mb-4">
                    <MdOutlineAccountBalanceWallet className="text-secondary text-lg" />
                    <h2 className="text-base font-semibold">
                        Recent Ledger Transactions
                    </h2>
                </div>

                <div className="space-y-2.5">
                    {user.transactions && user.transactions.length > 0 ? (
                        user.transactions.map((tx) => (
                            <div key={tx.id} className="p-3 rounded-md border bg-background flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-semibold">{tx.title}</p>
                                    <p className="text-[11px] text-gray-400">{tx.subtitle || tx.type}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold ${tx.is_positive ? 'text-secondary' : ''}`}>
                                        {tx.is_positive ? '+ ' : '- '} ৳ {tx.amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 py-4 text-center">No transactions recorded yet.</p>
                    )}
                </div>
            </div>
        </RootLayout>
    );
}
