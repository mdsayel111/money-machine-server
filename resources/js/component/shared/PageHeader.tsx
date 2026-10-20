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
        <div className="bg-foreground border p-4 rounded-md mb-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
                {hasBack && (
                    <button
                        onClick={() => window.history.back()}
                        className="text-2xl cursor-pointer"
                        title="Go back"
                    >
                        <BiArrowBack className="text-secondary" />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-semibold">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {buttons && (
                <div className="flex items-center gap-2">
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
