'use client';

import React, { useState } from 'react';
import {
    HealthScoreCard,
    SentimentBar,
    TrendingTopicsList,
    VolumeGraph,
    ExecutiveSummaryCard,
    UnansweredQuestionsCard,
    MemberGeographyCard,
    ActiveUsersCard
} from './DashboardComponents';
import { motion } from 'framer-motion';
import {
    Message01Icon,
    Copy01Icon,
    Tick01Icon,
    ChartBarLineIcon,
} from 'hugeicons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { toast } from 'sonner';

export interface AnalysisResult {
    summary: string;
    healthScore: number;
    sentiment: { positive: number, neutral: number, negative: number };
    topics: string[];
    // AI-detected (kept for compat)
    unansweredQuestions: string[];
    // Programmatically detected from actual chat structure
    detectedUnansweredQuestions: string[];
    faqs: { question: string, answer: string }[];
    engagementPost: string;
    followUp: string[];
    volumeData: { name: string, messages: number }[];
    topContributors: { name: string, count: number }[];
    memberGeography: { country: string, count: number }[];
}

interface ResultsDisplayProps {
    results: AnalysisResult;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(results.engagementPost);
        setCopied(true);
        toast.success('Engagement post copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Map AI topics to the format expected by TrendingTopicsList
    // Using index-weighted counts for visual differentiation since AI returns strings only
    const topicData = results.topics.map((topic, i) => ({
        name: topic,
        count: Math.max(10 - i * 1.5, 2) | 0
    }));

    // Prefer programmatic detection; fall back to AI-detected if empty
    const unansweredToShow = (results.detectedUnansweredQuestions?.length ?? 0) > 0
        ? results.detectedUnansweredQuestions
        : (results.unansweredQuestions ?? []);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-12 pb-20"
        >
            {/* 1. Executive Summary */}
            <motion.div variants={item}>
                <ExecutiveSummaryCard content={results.summary} />
            </motion.div>

            {/* 2. Topics & Draft Post (Side by Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Topics */}
                <motion.div variants={item}>
                    <Card className="rounded-[3rem] border-none shadow-premium bg-white h-full overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full flex items-center gap-2">
                                <ChartBarLineIcon className="w-3 h-3" />
                                TOP TOPICS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <TrendingTopicsList topics={topicData} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Draft Post */}
                <motion.div variants={item}>
                    <Card className="rounded-[3rem] border-none shadow-premium bg-white h-full overflow-hidden relative group">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full flex items-center gap-2">
                                <Message01Icon className="w-3 h-3" />
                                ENGAGEMENT DRAFT
                            </CardTitle>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors group-hover:scale-110 duration-300"
                            >
                                {copied ? <Tick01Icon className="w-4 h-4 text-green-600" /> : <Copy01Icon className="w-4 h-4 text-primary" />}
                            </button>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="bg-[#F8F7F4] p-6 rounded-[2rem] border border-border/40 text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap italic">
                                &ldquo;{results.engagementPost}&rdquo;
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider text-center mt-4 opacity-60">Ready for Telegram or WhatsApp</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* 3. Community Analytics */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <h3 className="text-xl font-heading font-black text-foreground">Community Analytics</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <motion.div variants={item} className="md:col-span-4">
                        <HealthScoreCard score={results.healthScore} />
                    </motion.div>

                    <motion.div variants={item} className="md:col-span-8">
                        <SentimentBar sentiment={results.sentiment} />
                    </motion.div>
                </div>

                <motion.div variants={item}>
                    <VolumeGraph data={results.volumeData} />
                </motion.div>
            </div>

            {/* 4. Member Insights — Geography + Active Users */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <h3 className="text-xl font-heading font-black text-foreground">Member Insights</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div variants={item}>
                        <MemberGeographyCard geography={results.memberGeography ?? []} />
                    </motion.div>
                    <motion.div variants={item}>
                        <ActiveUsersCard contributors={results.topContributors ?? []} />
                    </motion.div>
                </div>
            </div>

            {/* 5. Unanswered Questions (Dark Card — always shown) */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <h3 className="text-xl font-heading font-black text-foreground">Unanswered Questions</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>
                <motion.div variants={item}>
                    <UnansweredQuestionsCard questions={unansweredToShow} />
                </motion.div>
            </div>

            {/* 6. FAQs (Accordion) */}
            <motion.div variants={item} className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                    <h3 className="text-xl font-heading font-black text-foreground">Frequent Questions</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>
                <Card className="rounded-[3rem] border-none shadow-premium bg-white p-6 md:p-10">
                    <Accordion items={results.faqs} />
                </Card>
            </motion.div>

            {/* 7. Recommended Next Steps */}
            <motion.div variants={item} className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <h3 className="text-xl font-heading font-black text-foreground">Recommended Actions</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.followUp.map((action, i) => (
                        <div key={i} className="group p-8 bg-white/50 border border-border/40 rounded-[2.5rem] flex flex-col hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                                <span className="text-primary font-black text-xs">{i + 1}</span>
                            </div>
                            <p className="text-sm font-bold text-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                {action}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
