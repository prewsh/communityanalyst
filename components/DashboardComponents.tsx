'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HelpCircle, ThumbsUp, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeData {
    name: string;
    messages: number;
}

interface SentimentData {
    positive: number;
    neutral: number;
    negative: number;
}

// --- Health Score Component ---
export function HealthScoreCard({ score }: { score: number }) {
    // Color based on score
    const color = score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-medium">Community Health</CardTitle>
                <Activity className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <div className={`text-5xl font-bold ${color}`}>{score}</div>
                    <div className="text-sm text-muted-foreground">/ 10</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Based on engagement & sentiment
                </p>
            </CardContent>
        </Card>
    );
}

// --- Sentiment Bar Component ---
export function SentimentBar({ sentiment }: { sentiment: SentimentData }) {
    // Normalize to 100% just in case
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    const pos = (sentiment.positive / total) * 100;
    const neu = (sentiment.neutral / total) * 100;
    const neg = (sentiment.negative / total) * 100;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-sm font-medium">Sentiment Overview</CardTitle>
                <ThumbsUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex mt-2 shadow-inner">
                    <div style={{ width: `${pos}%` }} className="h-full bg-green-500" title={`Positive: ${Math.round(pos)}%`} />
                    <div style={{ width: `${neu}%` }} className="h-full bg-muted-foreground/30" title={`Neutral: ${Math.round(neu)}%`} />
                    <div style={{ width: `${neg}%` }} className="h-full bg-red-400" title={`Negative: ${Math.round(neg)}%`} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Positive</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Neutral</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Negative</div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Unanswered Questions Component ---
export function UnansweredQuestionsList({ questions }: { questions: string[] }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2">
                <div className="p-2 bg-secondary/20 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <CardTitle className="font-heading">Unanswered Questions</CardTitle>
            </CardHeader>
            <CardContent>
                {questions && questions.length > 0 ? (
                    <ul className="space-y-3">
                        {questions.slice(0, 5).map((q, i) => (
                            <li key={i} className="p-3 bg-secondary/10 rounded-lg border border-secondary/20 text-sm text-foreground">
                                {q}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No unanswered questions detected.</p>
                )}
            </CardContent>
        </Card>
    );
}

// --- Volume Graph Component ---
export function VolumeGraph({ data }: { data: VolumeData[] }) {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="font-heading">Message Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number | undefined) => [value, "Messages"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="messages"
                            stroke="#E5446D"
                            strokeWidth={3}
                            dot={{ fill: '#E5446D', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// --- Member Geography Component ---
export function MemberGeographyCard({ data }: { data?: { country: string, count: number }[] }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="font-heading">Member Geography</CardTitle>
            </CardHeader>
            <CardContent>
                {data && data.length > 0 ? (
                    <ul className="space-y-3">
                        {data.slice(0, 5).map((item, i) => (
                            <li key={i} className="flex justify-between items-center p-3 bg-muted/10 rounded-lg border border-border text-sm text-foreground">
                                <span className="font-medium">{item.country}</span>
                                <span className="text-muted-foreground font-semibold">{item.count}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No geography data available.</p>
                )}
            </CardContent>
        </Card>
    );
}
