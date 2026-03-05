'use client';

import React, { useEffect, useState } from 'react';
import { Tick01Icon, Loading03Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'completed';
}

interface AnalysisProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AnalysisProgressModal({ isOpen, onClose }: AnalysisProgressModalProps) {
    const [steps, setSteps] = useState<Step[]>([
        { id: 'parser', label: 'Initializing parser . . .', status: 'completed' },
        { id: 'messages', label: 'Loading 2,147 messages . . .', status: 'completed' },
        { id: 'keywords', label: 'Detected: pre-seed, AI tools, co-founder', status: 'completed' },
        { id: 'voices', label: 'Identifying key voices . . .', status: 'loading' },
        { id: 'structure', label: 'Parsing message structure', status: 'pending' },
        { id: 'entities', label: 'Extracting topics & entities', status: 'pending' },
        { id: 'sentiment', label: 'Running sentiment analysis', status: 'pending' },
        { id: 'drafts', label: 'Generating content drafts', status: 'pending' },
    ]);

    // Simulate progress for visual fidelity matching images
    useEffect(() => {
        if (!isOpen) return;

        const timers: NodeJS.Timeout[] = [];

        const updateStep = (id: string, status: 'pending' | 'loading' | 'completed') => {
            setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        };

        // Simulated progress
        timers.push(setTimeout(() => updateStep('voices', 'completed'), 1500));
        timers.push(setTimeout(() => updateStep('structure', 'loading'), 1600));
        timers.push(setTimeout(() => updateStep('structure', 'completed'), 3000));
        timers.push(setTimeout(() => updateStep('entities', 'loading'), 3100));

        return () => timers.forEach(clearTimeout);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-lg glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden premium-shadow"
                    >
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="relative">
                                <Loading03Icon className="w-12 h-12 text-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-heading font-extrabold text-foreground">Reading your community</h3>
                                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">PARSING 2,147 MESSAGES</p>
                            </div>

                            <div className="w-full space-y-3 pt-4">
                                {steps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex items-center gap-4 py-3.5 px-6 rounded-2xl transition-all duration-500 border",
                                            step.status === 'completed'
                                                ? "bg-white/40 border-border/40"
                                                : step.status === 'loading'
                                                    ? "bg-white border-primary/20 shadow-sm"
                                                    : "bg-transparent border-transparent opacity-40"
                                        )}
                                    >
                                        <div className="flex-shrink-0">
                                            {step.status === 'completed' ? (
                                                <Tick01Icon className="w-4 h-4 text-green-600" />
                                            ) : step.status === 'loading' ? (
                                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold tracking-tight text-left flex-1",
                                            step.id === 'keywords' ? "text-primary/70 italic" : "text-foreground",
                                            step.status === 'loading' ? "text-primary font-black" : ""
                                        )}>
                                            {step.label}
                                        </span>
                                        {step.status === 'completed' && step.id === 'messages' && (
                                            <span className="text-[10px] font-black text-green-600">100%</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 text-sm font-bold text-destructive bg-destructive/5 border border-destructive/10 rounded-2xl hover:bg-destructive/10 transition-all mt-4"
                            >
                                Stop Analyzing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
