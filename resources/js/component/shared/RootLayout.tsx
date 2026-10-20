import { navitems } from "@/data/navitems";
import { Link, router, usePage } from "@inertiajs/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RootLayout as NotationUIRootLayout, ProfileDropdownContents } from "notation-ui";
import { LogOut, User as UserIcon } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const authUser = (props as any)?.auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <NotationUIRootLayout
            navItems={navitems as any}
            logoSrc="/logo.png"
            LinkComponent={Link}
            currentPath={url}
            profileDropdownContents={
                <ProfileDropdownContents
                    username={authUser?.name || 'Administrator'}
                    menuItems={[
                        {
                            label: `Role: ${authUser?.role || 'Admin'}`,
                            icon: UserIcon,
                            onClick: () => router.visit('/users'),
                        }
                    ]}
                    logoutItem={{
                        label: 'Logout',
                        icon: LogOut,
                        onClick: handleLogout,
                    }}
                />
            }
        >
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {children}
            </div>
            <ToastContainer position="top-right" autoClose={4000} theme="colored" />
        </NotationUIRootLayout>
    );
}
