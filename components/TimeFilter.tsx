'use client';

import React from 'react';
import { HourglassIcon, Calendar03Icon, AllBookmarkIcon, Tick01Icon, CalendarAdd01Icon } from 'hugeicons-react';
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
            label: 'Last 24hrs',
            icon: <HourglassIcon className="w-4 h-4" />
        },
        {
            value: '7d',
            label: 'Last 7 Days',
            icon: <Calendar03Icon className="w-4 h-4" />
        },
        {
            value: '30d',
            label: 'Last 30 Days',
            icon: <CalendarAdd01Icon className="w-4 h-4" />
        },
        {
            value: '90d',
            label: 'Last 90 Days',
            icon: <CalendarAdd01Icon className="w-4 h-4" />
        },
        {
            value: 'all',
            label: 'All Time',
            icon: <AllBookmarkIcon className="w-4 h-4" />
        },
    ];

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Select your timeline</p>
            <div className="flex items-center gap-2 p-1.5 bg-[#F8F7F4] rounded-2xl border border-border/50 w-full overflow-x-auto no-scrollbar">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        disabled={disabled}
                        className={cn(
                            "flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap min-w-fit",
                            value === option.value
                                ? "bg-white text-foreground shadow-sm border border-border/50"
                                : "text-muted-foreground hover:text-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {value === option.value && (
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-green-200 bg-green-50 text-green-600">
                                <Tick01Icon className="w-3 h-3" />
                            </div>
                        )}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
