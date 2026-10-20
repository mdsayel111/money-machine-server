import { navitems } from "@/data/navitems";
import { Link, router, usePage } from "@inertiajs/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootLayout as NotationUIRootLayout, Button } from "notation-ui";
import { FiLogOut } from "react-icons/fi";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const authUser = (props as any)?.auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <NotationUIRootLayout
            navItems={navitems}
            logoSrc="/logo.png"
            LinkComponent={Link}
            currentPath={url}
            extraHeader={
                <div className="flex items-center gap-3">
                    {authUser && (
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{authUser.name}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase">{authUser.role || 'Admin'}</span>
                        </div>
                    )}
                    <Button
                        size="sm"
                        variant="danger"
                        styleType="outline"
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                        title="Sign Out"
                    >
                        <FiLogOut className="text-sm" />
                        <span className="hidden md:inline">Logout</span>
                    </Button>
                </div>
            }
        >
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {children}
            </div>
            <ToastContainer position="top-right" autoClose={4000} theme="colored" />
        </NotationUIRootLayout>
    );
}
