import { showNetworkError, showRequestError, showRequestException } from '@/lib/requestToast';
import { useForm, Link } from '@inertiajs/react';
import { FiArrowRight, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Button, Input } from 'notation-ui';

export default function SignUp() {
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    const handleRegister = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post('/signup', {
            onSuccess: () => toast.success("Account registered successfully! Welcome to Money Machine."),
            onError: (error) => showRequestError(error),
            onNetworkError: showNetworkError,
            onHttpException: showRequestException,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as any, value);
    };

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
            <div className="grid w-full max-w-md overflow-hidden rounded-3xl rounded-lg bg-foreground border border-border">
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
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
                                Join workspace
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                                Sign up
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Create your administrator account to get started.
                            </p>
                        </div>

                        <div className="mt-6 space-y-4 w-full">
                            <Input
                                id="name"
                                name="name"
                                label="Full Name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your full name"
                                inputSize="lg"
                                leadingIcon={<FiUser aria-hidden="true" />}
                                className="space-y-2"
                                value={data.name}
                                onChange={handleInputChange}
                            />

                            <Input
                                id="email"
                                name="email"
                                label="Email Address"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email address"
                                inputSize="lg"
                                leadingIcon={<FiMail aria-hidden="true" />}
                                className="space-y-2"
                                value={data.email}
                                onChange={handleInputChange}
                            />

                            <Input
                                id="username"
                                name="username"
                                label="Username / Admin Code"
                                type="text"
                                autoComplete="username"
                                placeholder="Choose an admin username"
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
                                autoComplete="new-password"
                                placeholder="Create a secure password"
                                inputSize="lg"
                                leadingIcon={<FiLock aria-hidden="true" />}
                                className="space-y-2"
                                value={data.password}
                                onChange={handleInputChange}
                            />

                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Confirm Password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Re-enter your password"
                                inputSize="lg"
                                leadingIcon={<FiLock aria-hidden="true" />}
                                className="space-y-2"
                                value={data.password_confirmation}
                                onChange={handleInputChange}
                            />

                            <Button
                                onClick={handleRegister}
                                type="button"
                                variant="primary"
                                disabled={processing}
                                className="group h-12 w-full gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-700/20 mt-2"
                            >
                                {processing ? "Creating account..." : "Sign up"}
                                <FiArrowRight
                                    className="text-base transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-secondary hover:underline">
                                    Sign in
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
