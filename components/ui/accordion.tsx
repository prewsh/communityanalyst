'use client';

import * as React from 'react';
import { ArrowDown01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionProps {
    items: { question: string; answer: string }[];
}

export function Accordion({ items }: AccordionProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="border-b border-border/40 last:border-none pb-4 last:pb-0 overflow-hidden">
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between py-4 text-left group"
                    >
                        <span className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {item.question}
                        </span>
                        <div className={cn(
                            "p-2 rounded-xl bg-muted/20 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300",
                            openIndex === index ? "transform rotate-180 bg-primary/10 text-primary" : ""
                        )}>
                            <ArrowDown01Icon className="w-4 h-4" />
                        </div>
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="pt-2 pb-6 text-sm font-bold text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
