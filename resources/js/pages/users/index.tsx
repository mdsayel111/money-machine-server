import ActionButton from "@/component/shared/ActionButton";
import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { Link, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FiEye, FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { NoData, Pagination, SearchInput, Table, Tbody, Td, Tr, Input } from "notation-ui";

type UserItem = {
    id: number;
    name: string;
    email: string;
    user_code: string;
    phone?: string;
    avatar_url?: string;
    tier_level: string;
    available_balance: number;
    today_earnings: number;
    lifetime_earnings: number;
    referral_code: string;
    is_active: boolean;
    referrer?: { name: string; user_code: string };
};

type MembershipTier = {
    id: number;
    name: string;
};

export default function UsersIndex({
    users,
    tiers,
    filters
}: {
    users: TPagination<UserItem>;
    tiers: MembershipTier[];
    filters: { search: string; tier?: string };
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedTier, setSelectedTier] = useState(filters.tier || "");
    const [page, setPage] = useState(users.current_page);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const { data, setData, patch, processing, reset } = useForm({
        tier_level: 'Silver',
        available_balance: 0,
        is_active: true,
    });

    useEffect(() => {
        router.get("/users", { search, tier: selectedTier, page }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, selectedTier, page]);

    const handleOpenEdit = (user: UserItem) => {
        setEditingUser(user);
        setData({
            tier_level: user.tier_level,
            available_balance: user.available_balance,
            is_active: user.is_active,
        });
    };

    const handleSaveUser = () => {
        if (!editingUser) return;
        patch(`/users/${editingUser.id}`, {
            onSuccess: () => {
                toast.success("User updated successfully!");
                setEditingUser(null);
                reset();
            },
            onError: () => toast.error("Failed to update user."),
        });
    };

    return (
        <RootLayout>
            <PageHeader
                title="Users & Network"
                subtitle="Manage registered members, review referral trees, and monitor wallet balances."
                hasBack={false}
            />

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTier}
                        onChange={(e) => { setSelectedTier(e.target.value); setPage(1); }}
                        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none"
                    >
                        <option value="">All Tiers</option>
                        {tiers.map((t) => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full sm:w-72">
                    <SearchInput
                        placeholder="Search name, code, email..."
                        value={search}
                        onChange={(e: any) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Members Table */}
            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["User / Code", "Tier", "Available Balance", "Lifetime Earnings", "Referral Code", "Referred By", "Status", "Actions"]}
                />

                <Tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {users.data.length > 0 ? (
                        users.data.map((user) => (
                            <Tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <Td>
                                    <div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="text-[11px] text-slate-500 font-mono">{user.user_code || `ID: ${user.id}`}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        user.tier_level === 'Diamond' ? 'bg-purple-100 text-purple-700' :
                                        user.tier_level === 'Platinum' ? 'bg-indigo-100 text-indigo-700' :
                                        user.tier_level === 'Gold' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                        {user.tier_level}
                                    </span>
                                </Td>
                                <Td className="font-bold text-xs text-emerald-600">
                                    ৳ {user.available_balance.toFixed(2)}
                                </Td>
                                <Td className="text-xs text-slate-600 font-medium">
                                    ৳ {user.lifetime_earnings.toFixed(2)}
                                </Td>
                                <Td>
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        {user.referral_code || '—'}
                                    </span>
                                </Td>
                                <Td className="text-xs text-slate-500">
                                    {user.referrer ? (
                                        <span>{user.referrer.name}</span>
                                    ) : (
                                        <span className="text-slate-400 italic">Direct</span>
                                    )}
                                </Td>
                                <Td>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {user.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                                            title="View Member Hierarchy & Profile"
                                        >
                                            <FiEye className="text-base" />
                                        </Link>
                                        <button
                                            onClick={() => handleOpenEdit(user)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                            title="Quick Adjust Tier & Balance"
                                        >
                                            <FiEdit2 className="text-base" />
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        ))
                    ) : (
                        <NoData />
                    )}
                </Tbody>
            </Table>

            {/* Pagination */}
            <div className="mx-2 mb-8">
                <Pagination
                    currentPage={users.current_page}
                    totalPages={users.last_page}
                    onPageChange={setPage}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <Modal
                    open={Boolean(editingUser)}
                    onClose={() => setEditingUser(null)}
                    title={`Adjust Member: ${editingUser.name}`}
                    onSave={handleSaveUser}
                    loading={processing}
                    saveText="Save Changes"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Membership Tier
                            </label>
                            <select
                                value={data.tier_level}
                                onChange={(e) => setData('tier_level', e.target.value)}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-medium focus:outline-none"
                            >
                                {tiers.map((t) => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Wallet Available Balance (৳)
                            </label>
                            <Input
                                type="number"
                                step="0.5"
                                value={data.available_balance.toString()}
                                onChange={(e) => setData('available_balance', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                Account Active & In Good Standing
                            </label>
                        </div>
                    </div>
                </Modal>
            )}
        </RootLayout>
    );
}
