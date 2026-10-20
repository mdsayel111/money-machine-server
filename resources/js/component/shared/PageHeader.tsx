import React from 'react';
import { BiArrowBack } from "react-icons/bi";

export default function PageHeader({
    title,
    subtitle,
    buttons,
    hasBack = true
}: {
    title: string;
    subtitle?: string;
    buttons?: React.ReactNode[];
    hasBack?: boolean;
}) {
    return (
        <div className="bg-foreground border border-slate-200 dark:border-slate-800 p-5 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
                {hasBack && (
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-secondary transition-all cursor-pointer"
                        title="Go back"
                    >
                        <BiArrowBack className="text-2xl" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {buttons && buttons.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {buttons.map((button, index) => (
                        <React.Fragment key={index}>
                            {button}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
