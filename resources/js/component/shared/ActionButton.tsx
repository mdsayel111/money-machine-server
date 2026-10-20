import { Dropdown, DropdownContent, DropdownItem } from 'notation-ui';

type ItemProps = {
    Icon: any;
    label: string;
    className?: string;
    onClick?: () => void;
};

export default function ActionButton({ items }: { items: ItemProps[] }) {
    return (
        <Dropdown label="Actions" variant="primary" styleType="outline" triggerClassName="py-1.5 px-3 text-xs font-semibold" align="end">
            <DropdownContent>
                {items?.map((item, index) => {
                    const { Icon, label, className, onClick } = item;
                    return (
                        <DropdownItem key={index} className={`flex items-center gap-2 cursor-pointer ${className || ''}`} onClick={onClick}>
                            {Icon && <Icon className="text-sm" />}
                            <span>{label}</span>
                        </DropdownItem>
                    );
                })}
            </DropdownContent>
        </Dropdown>
    );
}
