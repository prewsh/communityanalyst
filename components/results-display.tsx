'use client';

import { motion } from 'framer-motion';
import { Copy, Check, MessageSquare, TrendingUp, HelpCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { HealthScoreCard, SentimentBar, UnansweredQuestionsList, VolumeGraph, MemberGeographyCard } from '@/components/DashboardComponents';
import { TopContributors } from '@/components/TopContributors';

// Define types for the analysis result based on the API response structure
interface AnalysisResult {
    summary: string;
    healthScore?: number;
    sentiment?: { positive: number; neutral: number; negative: number };
    unansweredQuestions?: string[];
    topics: string[];
    faqs: { question: string; answer: string }[];
    engagementPost: string;
    followUp: string[];
    volumeData?: { name: string; messages: number }[];
    topContributors?: { name: string; count: number }[];
    memberGeography?: { country: string; count: number }[];
}

export function AnalysisResults({ data, isLoading = false }: { data: AnalysisResult, isLoading?: boolean }) {
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
        <>
            <motion.div
                className={`space-y-6 w-full max-w-6xl mx-auto mt-12 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-heading font-bold text-foreground">Community Dashboard</h2>
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <motion.div variants={item}>
                        <HealthScoreCard score={data.healthScore || 0} />
                    </motion.div>
                    <motion.div variants={item}>
                        <SentimentBar sentiment={data.sentiment || { positive: 0, neutral: 100, negative: 0 }} />
                    </motion.div>
                    <motion.div variants={item} className="md:row-span-2">
                        <UnansweredQuestionsList questions={data.unansweredQuestions || []} />
                    </motion.div>
                    <motion.div variants={item} className="md:col-span-2">
                        {data.volumeData ? <VolumeGraph data={data.volumeData} /> :
                            <Card>
                                <CardContent className="py-10 text-center text-gray-500">No volume data available</CardContent>
                            </Card>}
                    </motion.div>
                </div>

                <h3 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Analysis Details</h3>

                {/* Executive Summary */}
                <motion.div variants={item}>
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="font-heading text-xl">Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {data.summary}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>



                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Top Contributors */}
                    <motion.div variants={item}>
                        <TopContributors contributors={data.topContributors} />
                    </motion.div>

                    {/* Member Geography */}
                    <motion.div variants={item}>
                        <MemberGeographyCard data={data.memberGeography} />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Topics */}
                    <motion.div variants={item}>
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                                <div className="p-2 bg-secondary/20 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-secondary" />
                                </div>
                                <CardTitle className="font-heading">Top Topics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {data.topics.map((topic, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-medium border border-secondary/20">
                                                {i + 1}
                                            </span>
                                            <span className="text-foreground font-medium">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Engagement Post */}
                    <motion.div variants={item}>
                        <Card className="h-full bg-gradient-to-br from-muted/30 to-background border-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                    </div>
                                    <CardTitle className="font-heading">Draft Post</CardTitle>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border shadow-sm"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-secondary" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </button>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-background p-4 rounded-lg border border-border shadow-sm text-foreground whitespace-pre-wrap font-medium text-sm">
                                    {data.engagementPost}
                                </div>
                                <p className="text-xs text-center text-muted-foreground/70 mt-2">
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
                            <div className="p-2 bg-secondary/20 rounded-lg">
                                <HelpCircle className="w-6 h-6 text-secondary" />
                            </div>
                            <CardTitle className="font-heading">Frequent Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion items={data.faqs} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Follow Up Actions */}
                <motion.div variants={item}>
                    <Card className="bg-foreground text-background border-border">
                        <CardHeader>
                            <CardTitle className="text-background font-heading">Recommended Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {data.followUp.map((action, i) => (
                                    <li key={i} className="flex items-center gap-3 p-3 bg-foreground/90 rounded-lg border border-foreground/80">
                                        <div className="w-2 h-2 bg-secondary rounded-full" />
                                        <span className="text-background/90 text-sm">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    );
}
