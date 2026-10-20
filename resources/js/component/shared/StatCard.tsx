import { cn } from "@/lib/utils";

export default function StatCard({
    Icon,
    value,
    label,
    iconClassName
}: {
    Icon: any;
    value: string | number;
    label: string;
    iconClassName?: string;
}) {
    return (
        <div className="bg-foreground border p-4 flex items-center gap-4 rounded-md">
            <div className={cn("p-3.5 rounded-full w-fit shrink-0", iconClassName)}>
                <Icon className="text-3xl" />
            </div>
            <div className="min-w-0">
                <h1 className="text-3xl font-semibold mb-0.5 text-slate-900 dark:text-white truncate">
                    {value}
                </h1>
                <h3 className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                    {label}
                </h3>
            </div>
        </div>
    );
}
