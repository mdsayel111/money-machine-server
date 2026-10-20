import { cn } from '@/lib/utils';
import React from 'react';

export default function WrapperDiv({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('bg-foreground p-6 rounded-lg', className)}>
            {children}
        </div>
    );
}
