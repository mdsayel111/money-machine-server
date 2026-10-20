import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import { TPagination } from "@/types/pagination";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { ChoiceSelect, NoData, Pagination, SearchInput, Table, Tbody, Td, Tr } from "notation-ui";

type TransactionItem = {
    id: number;
    title: string;
    subtitle?: string;
    amount: number;
    is_positive: boolean;
    type: 'task' | 'referral' | 'withdrawal' | 'bonus';
    status: string;
    created_at: string;
    user?: { id: number; name: string; user_code: string; email: string };
};

const typeOptions = [
    { value: "", label: "All Types" },
    { value: "task", label: "Task Rewards" },
    { value: "referral", label: "Referral Commissions" },
    { value: "withdrawal", label: "Withdrawals" },
    { value: "bonus", label: "Network Bonuses" },
];

export default function TransactionsIndex({
    transactions,
    filters
}: {
    transactions: TPagination<TransactionItem>;
    filters: { search?: string; type?: string };
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedType, setSelectedType] = useState(filters.type || "");
    const [page, setPage] = useState(transactions.current_page);

    useEffect(() => {
        router.get("/transactions", { search, type: selectedType, page }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, selectedType, page]);

    return (
        <RootLayout>
            <PageHeader
                title="Transactions Ledger"
                subtitle="Complete immutable financial audit trail of all task rewards, referral commissions, cashouts, and bonuses."
                hasBack={false}
            />

            <div className="flex flex-col gap-3 rounded-t-lg border-x border-t bg-foreground p-4 sm:flex-row justify-between sm:items-center">
                <ChoiceSelect
                    searchable={false}
                    options={typeOptions}
                    value={selectedType}
                    onChange={(value) => {
                        setSelectedType(String(value));
                        setPage(1);
                    }}
                    className="w-full sm:w-[180px]! cursor-pointer"
                />

                <div className="w-full sm:w-72">
                    <SearchInput
                        placeholder="Search title, member, or code..."
                        value={search}
                        onChange={(e: any) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Transaction ID", "Member", "Title / Note", "Type", "Amount", "Status", "Date"]}
                />

                <Tbody className="bg-white dark:bg-background">
                    {transactions.data.length > 0 ? (
                        transactions.data.map((tx) => (
                            <Tr key={tx.id}>
                                <Td className="font-mono text-xs text-gray-500">
                                    #TXN-{tx.id.toString().padStart(5, '0')}
                                </Td>
                                <Td>
                                    <div>
                                        <p className="font-semibold text-xs">{tx.user?.name || 'Member'}</p>
                                        <p className="text-[11px] text-gray-400 font-mono">{tx.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="text-xs font-semibold">{tx.title}</p>
                                    {tx.subtitle && (
                                        <p className="text-[11px] text-gray-400">{tx.subtitle}</p>
                                    )}
                                </Td>
                                <Td>
                                    <span className="text-xs font-semibold capitalize">
                                        {tx.type}
                                    </span>
                                </Td>
                                <Td>
                                    <span className={`font-bold text-xs ${
                                        tx.is_positive ? 'text-secondary' : ''
                                    }`}>
                                        {tx.is_positive ? '+ ' : '- '} ৳ {tx.amount.toFixed(2)}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-xs font-semibold text-green-600 capitalize">
                                        {tx.status}
                                    </span>
                                </Td>
                                <Td className="text-xs text-gray-500">
                                    {new Date(tx.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
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
                    currentPage={transactions.current_page}
                    totalPages={transactions.last_page}
                    onPageChange={setPage}
                    showInfo
                    size="sm"
                />
            </div>
        </RootLayout>
    );
}
