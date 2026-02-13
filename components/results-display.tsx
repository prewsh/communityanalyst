'use client';

import { motion } from 'framer-motion';
import { Copy, Check, MessageSquare, TrendingUp, HelpCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';

// Define types for the analysis result based on the API response structure
interface AnalysisResult {
    summary: string;
    topics: string[];
    faqs: { question: string; answer: string }[];
    engagementPost: string;
    followUp: string[];
}

export function AnalysisResults({ data }: { data: AnalysisResult }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.engagementPost);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-6 w-full max-w-4xl mx-auto mt-12"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Executive Summary */}
            <motion.div variants={item}>
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {data.summary}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Topics */}
                <motion.div variants={item}>
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <CardTitle>Top Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {data.topics.map((topic, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium border border-purple-100">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-700 font-medium">{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Engagement Post */}
                <motion.div variants={item}>
                    <Card className="h-full bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                                </div>
                                <CardTitle>Draft Post</CardTitle>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100 shadow-sm"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Copy className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm text-gray-800 whitespace-pre-wrap font-medium text-sm">
                                {data.engagementPost}
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                Ready to share on LinkedIn or Twitter
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* FAQs */}
            <motion.div variants={item}>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Frequent Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion items={data.faqs} />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Follow Up Actions */}
            <motion.div variants={item}>
                <Card className="bg-gray-900 text-white border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-100">Recommended Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {data.followUp.map((action, i) => (
                                <li key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-gray-300 text-sm">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
