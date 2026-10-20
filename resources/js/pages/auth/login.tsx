import { showNetworkError, showRequestError, showRequestException } from '@/lib/requestToast';
import { useForm, Link } from '@inertiajs/react';
import { FiArrowRight, FiLock, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Button, Input } from 'notation-ui';

export default function SignIn() {
    const { data, setData, post, processing } = useForm({
        username: '',
        password: '',
    });

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post('/login', {
            onSuccess: () => toast.success("Login successfully."),
            onError: (error) => showRequestError(error),
            onNetworkError: showNetworkError,
            onHttpException: showRequestException,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'username' || name === 'password') {
            setData(name as any, value);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
            <div className="grid w-full max-w-md overflow-hidden rounded-3xl rounded-lg bg-foreground border border-border">
                <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                    <div
                        className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-blue-700/30 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-slate-950">
                            M
                        </span>
                        <span className="text-lg font-bold tracking-tight">
                            Money Machine
                        </span>
                    </div>

                    <div className="relative max-w-md">
                        <p className="mb-5 text-sm font-semibold tracking-[0.22em] text-sky-300 uppercase">
                            Welcome back
                        </p>
                        <h1 className="text-4xl leading-tight font-black tracking-tight xl:text-5xl">
                            Good work starts with a clear view.
                        </h1>
                        <p className="mt-6 text-base leading-7 text-slate-300">
                            Sign in to manage your workspace and keep every
                            detail moving forward.
                        </p>
                    </div>

                    <p className="relative text-sm text-slate-400">
                        Thoughtful digital experiences, built together.
                    </p>
                </section>

                <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        <div className="mb-10 lg:hidden">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white">
                                    M
                                </span>
                                <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                                    Money Machine
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-secondary">
                                Your workspace
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                                Sign in
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Enter your account details to continue.
                            </p>
                        </div>

                        <div className="mt-4 space-y-5 w-full">
                            <Input
                                id="username"
                                name="username"
                                label="Username or Email"
                                type="text"
                                autoComplete="username"
                                placeholder="Enter your username or email"
                                inputSize="lg"
                                leadingIcon={<FiUser aria-hidden="true" />}
                                className="space-y-2"
                                value={data.username}
                                onChange={handleInputChange}
                            />

                            <Input
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                inputSize="lg"
                                leadingIcon={<FiLock aria-hidden="true" />}
                                className="space-y-2"
                                value={data.password}
                                onChange={handleInputChange}
                            />

                            <Button
                                onClick={handleLogin}
                                type="button"
                                variant="primary"
                                disabled={processing}
                                className="group h-12 w-full gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-700/20"
                            >
                                {processing ? "Signing in..." : "Sign in"}
                                <FiArrowRight
                                    className="text-base transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-semibold text-secondary hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                            Secure access for authorized team members.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
