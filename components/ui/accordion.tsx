'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionProps {
    items: { question: string; answer: string }[];
}

export function Accordion({ items }: AccordionProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        {item.question}
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-gray-500 transition-transform duration-200",
                                openIndex === index ? "transform rotate-180" : ""
                            )}
                        />
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="p-4 pt-0 text-gray-600 custom-prose">
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
