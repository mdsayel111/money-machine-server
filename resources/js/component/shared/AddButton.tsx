import { ReactNode } from 'react';
import { Button } from 'notation-ui';
import { HiOutlinePlus } from "react-icons/hi2";

export default function AddButton({
    children,
    onClick
}: {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
    return (
        <Button
            variant="primary"
            styleType="outline"
            className="flex items-center gap-4"
            onClick={onClick}
        >
            <HiOutlinePlus className="text-lg translate-y-px" />
            <span>{children}</span>
        </Button>
    );
}
