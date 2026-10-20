import { Th, Thead, Tr } from "notation-ui";

export default function TableHeader({ items }: { items: string[] }) {
    return (
        <Thead>
            <Tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {items?.map((item, index) => (
                    <Th
                        key={index}
                        className={`text-xs font-bold uppercase tracking-wider text-slate-500 py-3.5 px-4 ${
                            item.toLowerCase() === "action" || item.toLowerCase() === "actions"
                                ? "w-36 text-right"
                                : ""
                        }`}
                    >
                        {item}
                    </Th>
                ))}
            </Tr>
        </Thead>
    );
}
