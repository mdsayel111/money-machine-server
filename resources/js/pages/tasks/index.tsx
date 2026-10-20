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
import { Badge, ChoiceSelect, Input, NoData, Pagination, SearchInput, Table, Tbody, Td, Tr } from "notation-ui";

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
        reward_suffix: "Instant Credit",
        time_estimate: "2 mins",
        remaining_slots: "500 spots",
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
            reward_suffix: task.reward_suffix || "",
            time_estimate: task.time_estimate,
            remaining_slots: task.remaining_slots || "",
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
                title="Tasks Marketplace"
                subtitle="Configure sponsored micro-tasks, review platforms, and manage reward payout limits."
                buttons={[
                    <AddButton key="add" onClick={handleOpenCreate}>
                        Create Task
                    </AddButton>
                ]}
                hasBack={false}
            />

            <div className="bg-foreground p-4 border-x border-t rounded-t-lg flex justify-between items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">
                    Total: {tasks.total} tasks
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
                    items={["Task Title", "Platform", "Category", "Reward", "Time", "Slots", "Featured", "Status", "Action"]}
                />

                <Tbody className="bg-white dark:bg-background">
                    {tasks.data.length > 0 ? (
                        tasks.data.map((task) => (
                            <Tr key={task.id}>
                                <Td>
                                    <div>
                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{task.title}</p>
                                        {task.limit_notice && (
                                            <span className="text-[10px] text-amber-600 font-medium">
                                                {task.limit_notice}
                                            </span>
                                        )}
                                    </div>
                                </Td>
                                <Td>
                                    <span className="text-xs uppercase font-medium text-gray-600 dark:text-gray-300">
                                        {task.platform}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="capitalize text-xs text-gray-500">
                                        {task.category}
                                    </span>
                                </Td>
                                <Td className="font-semibold text-xs text-emerald-600">
                                    ৳ {task.reward.toFixed(2)}
                                </Td>
                                <Td className="text-xs text-gray-500">
                                    {task.time_estimate}
                                </Td>
                                <Td className="text-xs text-gray-500">
                                    {task.remaining_slots}
                                </Td>
                                <Td>
                                    {task.is_featured ? (
                                        <Badge variant="warning" styleType="soft">
                                            Featured
                                        </Badge>
                                    ) : (
                                        <span className="text-[11px] text-gray-400">—</span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge variant={task.is_active ? 'success' : 'danger'} styleType="soft">
                                        {task.is_active ? 'Active' : 'Disabled'}
                                    </Badge>
                                </Td>
                                <Td className="text-right">
                                    <ActionButton
                                        items={[
                                            {
                                                Icon: MdOutlineModeEdit,
                                                label: "Edit",
                                                className: "text-blue-500! py-1",
                                                onClick: () => handleOpenEdit(task),
                                            },
                                            {
                                                Icon: AiOutlineDelete,
                                                label: "Delete",
                                                className: "text-red-500! py-1",
                                                onClick: () => handleDelete(task.id),
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
            >
                <div className="space-y-4">
                    <Input
                        label="Task Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Watch Video & Like Post"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <ChoiceSelect
                            label="Platform"
                            searchable={false}
                            options={[
                                { value: "youtube", label: "YouTube" },
                                { value: "facebook", label: "Facebook" },
                                { value: "app", label: "App Review" },
                                { value: "tiktok", label: "TikTok" },
                                { value: "survey", label: "Survey" },
                            ]}
                            value={data.platform}
                            onChange={(val) => setData('platform', String(val))}
                        />

                        <ChoiceSelect
                            label="Category"
                            searchable={false}
                            options={[
                                { value: "social", label: "Social Media" },
                                { value: "app", label: "App Download" },
                                { value: "survey", label: "Paid Survey" },
                                { value: "all", label: "General" },
                            ]}
                            value={data.category}
                            onChange={(val) => setData('category', String(val))}
                        />
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
                            placeholder="e.g. Limit: 5/day"
                        />
                    </div>

                    <Input
                        label="Target Action URL"
                        value={data.action_url}
                        onChange={(e) => setData('action_url', e.target.value)}
                        placeholder="https://..."
                    />

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Instructions / Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full text-xs bg-foreground border p-3 rounded-md font-medium focus:outline-none"
                            placeholder="Detailed instructions for the user..."
                        />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-4 h-4 rounded text-secondary"
                            />
                            Feature on Home Screen
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded text-secondary"
                            />
                            Active & Open for Submissions
                        </label>
                    </div>
                </div>
            </Modal>
        </RootLayout>
    );
}
