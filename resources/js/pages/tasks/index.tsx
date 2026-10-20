import ActionButton from "@/component/shared/ActionButton";
import AddButton from "@/component/shared/AddButton";
import Modal from "@/component/shared/Modal";
import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import TableHeader from "@/component/shared/TableHeader";
import { showNetworkError, showRequestError, showRequestException } from "@/lib/requestToast";
import { TPagination } from "@/types/pagination";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { Input, NoData, Pagination, SearchInput, Table, Tbody, Td, Tr } from "notation-ui";

type TaskItem = {
    id: number;
    title: string;
    platform: string;
    category: string;
    tags?: string[];
    reward: number;
    reward_suffix?: string;
    time_estimate: string;
    remaining_slots?: string;
    limit_notice?: string;
    description?: string;
    action_url?: string;
    is_featured: boolean;
    is_active: boolean;
    submissions_count?: number;
};

export default function TasksIndex({
    tasks,
    filters
}: {
    tasks: TPagination<TaskItem>;
    filters: { search?: string; category?: string; platform?: string };
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || "");
    const [page, setPage] = useState(tasks.current_page);

    const { data, setData, post, patch, reset, processing } = useForm({
        title: "",
        platform: "youtube",
        category: "social",
        reward: 10,
        reward_suffix: "/ Per task",
        time_estimate: "2 mins",
        remaining_slots: "200+ left",
        limit_notice: "",
        description: "",
        action_url: "",
        is_featured: false,
        is_active: true,
    });

    useEffect(() => {
        router.get("/tasks", { search, page }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, page]);

    const handleOpenCreate = () => {
        setEditId(null);
        reset();
        setModalOpen(true);
    };

    const handleOpenEdit = (task: TaskItem) => {
        setEditId(task.id);
        setData({
            title: task.title,
            platform: task.platform,
            category: task.category,
            reward: task.reward,
            reward_suffix: task.reward_suffix || "/ Per task",
            time_estimate: task.time_estimate,
            remaining_slots: task.remaining_slots || "200+ left",
            limit_notice: task.limit_notice || "",
            description: task.description || "",
            action_url: task.action_url || "",
            is_featured: task.is_featured,
            is_active: task.is_active,
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (editId) {
            patch(`/tasks/${editId}`, {
                onSuccess: () => {
                    toast.success("Task updated successfully.");
                    setModalOpen(false);
                    reset();
                },
                onError: (errors) => showRequestError(errors),
                onHttpException: showRequestException,
                onNetworkError: showNetworkError,
            });
        } else {
            post(`/tasks`, {
                onSuccess: () => {
                    toast.success("Task created successfully.");
                    setModalOpen(false);
                    reset();
                },
                onError: (errors) => showRequestError(errors),
                onHttpException: showRequestException,
                onNetworkError: showNetworkError,
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this task?")) {
            router.delete(`/tasks/${id}`, {
                onSuccess: () => toast.success("Task deleted successfully."),
                onError: (errors) => showRequestError(errors),
                onHttpException: showRequestException,
                onNetworkError: showNetworkError,
            });
        }
    };

    return (
        <RootLayout>
            <PageHeader
                title="Task Marketplace"
                subtitle="Configure sponsored micro-tasks, review platforms, and manage reward payout limits."
                buttons={[
                    <AddButton key="add" onClick={handleOpenCreate}>
                        Add New Task
                    </AddButton>
                ]}
                hasBack={false}
            />

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-t-xl flex justify-between items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                    Total Published: {tasks.total} tasks
                </span>
                <div className="w-full sm:w-72">
                    <SearchInput
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e: any) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Table tableStyle="border" className="mb-4">
                <TableHeader
                    items={["Task Title", "Platform", "Category", "Reward", "Time", "Slots", "Featured", "Status", "Actions"]}
                />

                <Tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.data.length > 0 ? (
                        tasks.data.map((task) => (
                            <Tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <Td>
                                    <div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{task.title}</p>
                                        {task.limit_notice && (
                                            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                                {task.limit_notice}
                                            </span>
                                        )}
                                    </div>
                                </Td>
                                <Td>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                        {task.platform}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="capitalize text-xs text-slate-600 font-medium">
                                        {task.category}
                                    </span>
                                </Td>
                                <Td className="font-bold text-xs text-emerald-600">
                                    ৳ {task.reward.toFixed(2)}
                                </Td>
                                <Td className="text-xs text-slate-500">
                                    {task.time_estimate}
                                </Td>
                                <Td className="text-xs text-slate-500">
                                    {task.remaining_slots}
                                </Td>
                                <Td>
                                    {task.is_featured ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                            Featured
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">—</span>
                                    )}
                                </Td>
                                <Td>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        task.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {task.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <ActionButton
                                        items={[
                                            {
                                                Icon: MdOutlineModeEdit,
                                                label: "Edit",
                                                className: "text-blue-600!",
                                                onClick: () => handleOpenEdit(task),
                                            },
                                            {
                                                Icon: AiOutlineDelete,
                                                label: "Delete",
                                                className: "text-red-600!",
                                                onClick: () => handleDelete(task.id),
                                            }
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

            <div className="mx-2 mb-8">
                <Pagination
                    currentPage={tasks.current_page}
                    totalPages={tasks.last_page}
                    onPageChange={setPage}
                    showInfo
                    size="sm"
                />
            </div>

            {/* Create / Edit Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${editId ? "Edit" : "Create"} Task`}
                onSave={handleSave}
                loading={processing}
            >
                <div className="space-y-3.5">
                    <Input
                        label="Task Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Watch Video & Like Post"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Platform
                            </label>
                            <select
                                value={data.platform}
                                onChange={(e) => setData('platform', e.target.value)}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                            >
                                <option value="youtube">YouTube</option>
                                <option value="facebook">Facebook</option>
                                <option value="app">App Review</option>
                                <option value="tiktok">TikTok</option>
                                <option value="survey">Survey</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Category
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                            >
                                <option value="social">Social Media</option>
                                <option value="app">App Download</option>
                                <option value="survey">Paid Survey</option>
                                <option value="all">General</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Reward Amount (৳)"
                            type="number"
                            step="0.5"
                            value={data.reward.toString()}
                            onChange={(e) => setData('reward', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            label="Estimated Duration"
                            value={data.time_estimate}
                            onChange={(e) => setData('time_estimate', e.target.value)}
                            placeholder="e.g. 2 mins"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Remaining Slots Notice"
                            value={data.remaining_slots}
                            onChange={(e) => setData('remaining_slots', e.target.value)}
                            placeholder="e.g. 150 left"
                        />
                        <Input
                            label="Limit Notice Badge"
                            value={data.limit_notice}
                            onChange={(e) => setData('limit_notice', e.target.value)}
                            placeholder="e.g. Limit: 5/day or Bonus: 1.5x"
                        />
                    </div>

                    <Input
                        label="Target Action URL"
                        value={data.action_url}
                        onChange={(e) => setData('action_url', e.target.value)}
                        placeholder="https://..."
                    />

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Instructions / Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium focus:outline-none"
                            placeholder="Detailed instructions for the user..."
                        />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            Feature on Home Screen
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            Active & Open for Submissions
                        </label>
                    </div>
                </div>
            </Modal>
        </RootLayout>
    );
}
