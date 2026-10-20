import { showNetworkError, showRequestError, showRequestException } from '@/lib/requestToast';
import { useForm } from '@inertiajs/react';
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Button, Input } from 'notation-ui';

export default function SignIn() {
    const { data, setData, post, processing } = useForm({
        email: 'admin@moneymachine.com',
        password: 'admin123',
    });

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post('/login', {
            onSuccess: () => toast.success("Welcome back to Money Machine Admin!"),
            onError: (error) => showRequestError(error),
            onNetworkError: showNetworkError,
            onHttpException: showRequestException,
        });
    };

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 bg-slate-900">
            <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-800 lg:grid-cols-2">
                {/* Left Banner */}
                <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                    <div
                        className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-700/20 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xl font-black text-slate-950 shadow-md">
                            ৳
                        </span>
                        <div>
                            <span className="text-xl font-black tracking-tight text-white">
                                Money Machine
                            </span>
                            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                                Admin Portal
                            </span>
                        </div>
                    </div>

                    <div className="relative max-w-md my-auto py-10">
                        <p className="mb-4 text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase">
                            Operational Command
                        </p>
                        <h1 className="text-3xl leading-tight font-black tracking-tight text-white xl:text-4xl">
                            Empowering micro-earnings & multi-level network growth.
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed text-slate-300">
                            Monitor live task approvals, audit ledger transactions, manage tier commissions, and execute rapid bKash & Nagad disbursements.
                        </p>
                    </div>

                    <p className="relative text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Money Machine Core Engine • Powered by Laravel & Notation UI
                    </p>
                </section>

                {/* Right Form */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-12 xl:px-14 bg-white dark:bg-slate-900">
                    <div className="w-full max-w-md">
                        <div className="mb-8 lg:hidden flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-slate-950">
                                ৳
                            </span>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Money Machine
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Secure Access
                            </p>
                            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Administrator Sign In
                            </h2>
                            <p className="mt-2 text-xs text-slate-500">
                                Enter your administrative credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="mt-6 space-y-4">
                            <Input
                                id="email"
                                name="email"
                                label="Email or Admin Code"
                                type="text"
                                autoComplete="username"
                                placeholder="admin@moneymachine.com"
                                value={data.email}
                                leadingIcon={<FiMail aria-hidden="true" />}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <Input
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={data.password}
                                leadingIcon={<FiLock aria-hidden="true" />}
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <Button
                                onClick={handleLogin}
                                type="submit"
                                variant="primary"
                                disabled={processing}
                                className="group h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 text-sm font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center mt-2"
                            >
                                {processing ? "Signing in..." : "Sign in to Dashboard"}
                                <FiArrowRight
                                    className="text-base transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>
                        </form>

                        <div className="mt-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                            <p className="font-bold">Demo Admin Credentials:</p>
                            <p className="mt-1 text-[11px]">Email: <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">admin@moneymachine.com</code></p>
                            <p className="text-[11px]">Password: <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">password123</code></p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
