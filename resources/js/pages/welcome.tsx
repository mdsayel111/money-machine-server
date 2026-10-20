import { router } from "@inertiajs/react";
import { useEffect } from "react";

export default function Welcome() {
    useEffect(() => {
        router.visit("/dashboard");
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Redirecting to Dashboard...</span>
            </div>
        </div>
    );
}
