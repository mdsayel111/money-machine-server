import ActionButton from "@/component/shared/ActionButton";
import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import Modal from "@/component/shared/Modal";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { LuEye } from "react-icons/lu";
import { MdOutlineModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { ChoiceSelect, NoData, Pagination, SearchInput, Table, Tbody, Td, Tr, Input } from "notation-ui";

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

    const tierOptions = [
        { value: "", label: "All Tiers" },
        ...tiers.map((t) => ({ value: t.name, label: t.name }))
    ];

    return (
        <RootLayout>
            <PageHeader
                title="Users & Network"
                subtitle="Manage registered members, review referral trees, and monitor wallet balances."
                hasBack={false}
            />

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-t-lg border-x border-t bg-foreground p-4 sm:flex-row justify-between sm:items-center">
                <ChoiceSelect
                    searchable={false}
                    options={tierOptions}
                    value={selectedTier}
                    onChange={(value) => {
                        setSelectedTier(String(value));
                        setPage(1);
                    }}
                    className="w-full sm:w-[150px]! cursor-pointer"
                />

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

                <Tbody className="bg-white dark:bg-background">
                    {users.data.length > 0 ? (
                        users.data.map((user) => (
                            <Tr key={user.id}>
                                <Td>
                                    <div>
                                        <p className="font-semibold text-xs">{user.name}</p>
                                        <p className="text-[11px] text-gray-500 font-mono">{user.user_code || `ID: ${user.id}`}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <span className="font-semibold text-xs">{user.tier_level}</span>
                                </Td>
                                <Td className="font-bold text-xs text-secondary">
                                    ৳ {user.available_balance.toFixed(2)}
                                </Td>
                                <Td className="text-xs font-medium">
                                    ৳ {user.lifetime_earnings.toFixed(2)}
                                </Td>
                                <Td>
                                    <span className="font-mono text-xs bg-foreground border px-2 py-0.5 rounded-md">
                                        {user.referral_code || '—'}
                                    </span>
                                </Td>
                                <Td className="text-xs text-gray-500">
                                    {user.referrer ? (
                                        <span>{user.referrer.name}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Direct</span>
                                    )}
                                </Td>
                                <Td>
                                    <span className={`text-xs font-semibold ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                        {user.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <ActionButton
                                        items={[
                                            {
                                                Icon: LuEye,
                                                label: 'View Profile',
                                                className: 'text-blue-500! py-1',
                                                onClick: () => {
                                                    router.visit(`/users/${user.id}`);
                                                },
                                            },
                                            {
                                                Icon: MdOutlineModeEdit,
                                                label: 'Adjust Tier/Balance',
                                                className: 'text-green-500! py-1',
                                                onClick: () => {
                                                    handleOpenEdit(user);
                                                },
                                            },
                                        ]}
                                    />
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
                        <ChoiceSelect
                            label="Membership Tier"
                            searchable={false}
                            options={tiers.map((t) => ({ value: t.name, label: t.name }))}
                            value={data.tier_level}
                            onChange={(value) => setData('tier_level', String(value))}
                        />

                        <div>
                            <label className="block text-xs font-semibold mb-1">
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
                                className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                            />
                            <label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                Account Active & In Good Standing
                            </label>
                        </div>
                    </div>
                </Modal>
            )}
        </RootLayout>
    );
}
