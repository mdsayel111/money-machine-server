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
            styleType="solid"
            className="flex items-center gap-2 bg-[#00C076] hover:bg-[#009E60] text-white border-none shadow-sm text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all"
            onClick={onClick}
        >
            <HiOutlinePlus className="text-base" />
            <span>{children}</span>
        </Button>
    );
}
