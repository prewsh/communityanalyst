'use client';

import { Calendar, Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeRange } from '@/lib/processors';

interface TimeFilterProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
    disabled?: boolean;
}

export function TimeFilter({ value, onChange, disabled }: TimeFilterProps) {
    const options: { value: TimeRange; label: string; icon: React.ReactNode }[] = [
        {
            value: '24h',
            label: 'Last 24h',
            icon: <Clock className="w-4 h-4" />
        },
        {
            value: '7d',
            label: 'Last 7 Days',
            icon: <Calendar className="w-4 h-4" />
        },
        {
            value: 'all',
            label: 'All Time',
            icon: <History className="w-4 h-4" />
        },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    disabled={disabled}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                        value === option.value
                            ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                            : "bg-card text-muted-foreground border-border hover:border-primary/20 hover:bg-primary/10",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {option.icon}
                    {option.label}
                </button>
            ))}
        </div>
    );
}
