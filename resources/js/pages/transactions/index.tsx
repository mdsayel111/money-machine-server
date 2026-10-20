import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import { TPagination } from "@/types/pagination";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { NoData, Pagination, SearchInput, Table, Tbody, Td, Tr } from "notation-ui";

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

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedType}
                        onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="task">Task Rewards</option>
                        <option value="referral">Referral Commissions</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="bonus">Network Bonuses</option>
                    </select>
                </div>

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

                <Tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.data.length > 0 ? (
                        transactions.data.map((tx) => (
                            <Tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <Td className="font-mono text-xs text-slate-500">
                                    #TXN-{tx.id.toString().padStart(5, '0')}
                                </Td>
                                <Td>
                                    <div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{tx.user?.name || 'Member'}</p>
                                        <p className="text-[11px] text-slate-500 font-mono">{tx.user?.user_code}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                                    {tx.subtitle && (
                                        <p className="text-[11px] text-slate-400">{tx.subtitle}</p>
                                    )}
                                </Td>
                                <Td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        tx.type === 'referral' ? 'bg-blue-100 text-blue-700' :
                                        tx.type === 'task' ? 'bg-emerald-100 text-emerald-700' :
                                        tx.type === 'withdrawal' ? 'bg-purple-100 text-purple-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {tx.type}
                                    </span>
                                </Td>
                                <Td>
                                    <span className={`font-black text-xs ${
                                        tx.is_positive ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                    }`}>
                                        {tx.is_positive ? '+ ' : '- '} ৳ {tx.amount.toFixed(2)}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        {tx.status}
                                    </span>
                                </Td>
                                <Td className="text-xs text-slate-500">
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
