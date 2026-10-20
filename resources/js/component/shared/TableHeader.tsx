import { Th, Thead, Tr } from "notation-ui";

export default function TableHeader({ items }: { items: string[] }) {
    return (
        <Thead>
            <Tr className="bg-background dark:bg-foreground!">
                {items?.map((item, index) => (
                    <Th
                        key={index}
                        className={`${
                            item.toLowerCase() === "action" || item.toLowerCase() === "actions"
                                ? "w-50 text-right"
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
