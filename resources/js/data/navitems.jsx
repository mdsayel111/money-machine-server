import { CiBoxList } from "react-icons/ci";
import { FaRegFolderOpen } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoIosStats } from "react-icons/io";
import { IoBarChartOutline } from "react-icons/io5";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { TbReceipt } from "react-icons/tb";

export const navitems = [
    {
        name: 'Dashboard',
        icon: IoBarChartOutline,
        href: "/dashboard",
    },
    {
        name: "Users & Network",
        href: '/users',
        icon: HiOutlineUserGroup,
    },
    {
        name: "Tasks Marketplace",
        href: '/tasks',
        icon: CiBoxList,
    },
    {
        name: "Task Submissions",
        href: '/submissions',
        icon: FaRegFolderOpen,
    },
    {
        name: "Withdrawals",
        href: '/withdrawals',
        icon: MdOutlineAccountBalanceWallet,
    },
    {
        name: "Membership Tiers",
        href: '/tiers',
        icon: IoIosStats,
    },
    {
        name: "Transactions Ledger",
        href: '/transactions',
        icon: TbReceipt,
    },
];
