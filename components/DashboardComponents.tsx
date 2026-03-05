'use client';

import React from 'react';
import {
    Activity04Icon,
    ThumbsUpIcon,
    MapPinIcon,
    Target01Icon,
    UserIcon,
    HelpCircleIcon,
    AlertCircleIcon,
    Message01Icon
} from 'hugeicons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// --- Country Name → ISO 3166-1 alpha-2 mapping for flags ---
const COUNTRY_TO_ISO2: Record<string, string> = {
    'USA/Canada': 'US', 'Egypt': 'EG', 'South Africa': 'ZA', 'Netherlands': 'NL',
    'Belgium': 'BE', 'France': 'FR', 'Spain': 'ES', 'Italy': 'IT', 'Switzerland': 'CH',
    'UK': 'GB', 'Sweden': 'SE', 'Norway': 'NO', 'Germany': 'DE', 'Peru': 'PE',
    'Mexico': 'MX', 'Argentina': 'AR', 'Brazil': 'BR', 'Chile': 'CL', 'Colombia': 'CO',
    'Malaysia': 'MY', 'Australia': 'AU', 'Indonesia': 'ID', 'Philippines': 'PH',
    'New Zealand': 'NZ', 'Singapore': 'SG', 'Thailand': 'TH', 'Russia/Kazakhstan': 'RU',
    'Japan': 'JP', 'South Korea': 'KR', 'Vietnam': 'VN', 'China': 'CN', 'Turkey': 'TR',
    'India': 'IN', 'Pakistan': 'PK', 'Afghanistan': 'AF', 'Sri Lanka': 'LK',
    'Myanmar': 'MM', 'Iran': 'IR', 'Morocco': 'MA', 'Algeria': 'DZ', 'Tunisia': 'TN',
    'Libya': 'LY', 'Gambia': 'GM', 'Senegal': 'SN', 'Mauritania': 'MR',
    'Mali': 'ML', 'Guinea': 'GN', 'Ivory Coast': 'CI', 'Burkina Faso': 'BF',
    'Niger': 'NE', 'Togo': 'TG', 'Benin': 'BJ', 'Mauritius': 'MU', 'Liberia': 'LR',
    'Sierra Leone': 'SL', 'Ghana': 'GH', 'Nigeria': 'NG', 'Chad': 'TD',
    'Central African Republic': 'CF', 'Cameroon': 'CM', 'Cape Verde': 'CV',
    'Equatorial Guinea': 'GQ', 'Gabon': 'GA', 'Republic of the Congo': 'CG',
    'DRC': 'CD', 'Angola': 'AO', 'Guinea-Bissau': 'GW', 'Sudan': 'SD',
    'Rwanda': 'RW', 'Ethiopia': 'ET', 'Somalia': 'SO', 'Djibouti': 'DJ',
    'Kenya': 'KE', 'Tanzania': 'TZ', 'Uganda': 'UG', 'Burundi': 'BI',
    'Mozambique': 'MZ', 'Zambia': 'ZM', 'Madagascar': 'MG', 'Zimbabwe': 'ZW',
    'Namibia': 'NA', 'Malawi': 'MW', 'Lesotho': 'LS', 'Botswana': 'BW',
    'Eswatini': 'SZ', 'UAE': 'AE', 'Israel': 'IL', 'Saudi Arabia': 'SA',
};

function getFlagEmoji(countryName: string): string {
    const iso2 = COUNTRY_TO_ISO2[countryName];
    if (!iso2) return '🌍';
    return [...iso2.toUpperCase()]
        .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
        .join('');
}

// --- Health Score Component ---
export function HealthScoreCard({ score }: { score: number }) {
    const color = score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
    const bgColor = score >= 8 ? 'bg-green-50' : score >= 5 ? 'bg-yellow-50' : 'bg-red-50';

    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full">COMMUNITY HEALTH</CardTitle>
                <div className={cn("p-2 rounded-xl", bgColor)}>
                    <Activity04Icon className={cn("h-4 w-4", color)} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-5xl font-heading font-black tracking-tighter", color)}>{score}</span>
                    <span className="text-xl font-bold text-muted-foreground">/10</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground mt-4">
                    Based on engagement & sentiment
                </p>
            </CardContent>
        </Card>
    );
}

// --- Sentiment Overview Component ---
export function SentimentBar({ sentiment }: { sentiment: { positive: number, neutral: number, negative: number } }) {
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    const pos = (sentiment.positive / total) * 100;
    const neu = (sentiment.neutral / total) * 100;
    const neg = (sentiment.negative / total) * 100;

    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full">SENTIMENT OVERVIEW</CardTitle>
                <div className="p-2 bg-primary/5 rounded-xl">
                    <ThumbsUpIcon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-3 w-full bg-[#F8F7F4] rounded-full overflow-hidden flex gap-1 items-center px-1">
                    <div style={{ width: `${pos}%` }} className="h-1.5 rounded-full bg-green-500 transition-all duration-1000" />
                    <div style={{ width: `${neu}%` }} className="h-1.5 rounded-full bg-muted-foreground/30 transition-all duration-1000" />
                    <div style={{ width: `${neg}%` }} className="h-1.5 rounded-full bg-red-400 transition-all duration-1000" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">{Math.round(pos)}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Positive</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">{Math.round(neu)}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Neutral</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">{Math.round(neg)}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Negative</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Trending Topics Component ---
export function TrendingTopicsList({ topics }: { topics: { name: string, count: number }[] }) {
    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full">TRENDING TOPICS</CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">By message volume</span>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                    {topics.map((topic, i) => (
                        <div key={i} className="flex items-center gap-2 py-2 px-4 bg-[#F8F7F4] rounded-full border border-border/40 hover:border-primary/20 transition-all transition-colors group">
                            <span className="text-xs font-bold text-foreground">{topic.name}</span>
                            <span className="text-[10px] font-black text-muted-foreground bg-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm group-hover:text-primary">{topic.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Activity Pattern / Volume Graph Component ---
export function VolumeGraph({ data }: { data: { name: string, messages: number }[] }) {
    return (
        <Card className="rounded-[3rem] border-none shadow-premium h-full overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full">ACTIVITY PATTERN</CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Messages over time</span>
            </CardHeader>
            <CardContent className="h-[300px] px-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: '#706C61' }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8F7F4', radius: 12 }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}
                        />
                        <Bar dataKey="messages" fill="#E5446D" radius={[8, 8, 8, 8]} barSize={32}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FE6B8B' : '#FF8E53'} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// --- Executive Summary Component ---
export function ExecutiveSummaryCard({ content }: { content: string }) {
    return (
        <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden h-full">
            <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full w-fit flex items-center gap-2">
                    <Target01Icon className="w-3 h-3" />
                    EXECUTIVE SUMMARY
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-bold text-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                    {content}
                </p>
            </CardContent>
        </Card>
    );
}

// --- NEW: Unanswered Questions Card (Dark) ---
export function UnansweredQuestionsCard({ questions }: { questions: string[] }) {
    if (!questions || questions.length === 0) {
        return (
            <div className="p-8 bg-gray-900 rounded-[3rem] border border-gray-800 flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                    <HelpCircleIcon className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-gray-400 text-sm font-bold">No unanswered questions detected in this time window.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden relative">
            {/* Decorative blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="p-8 md:p-10 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                            <AlertCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-white font-heading font-bold text-base">Unanswered Questions</h4>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{questions.length} questions need attention</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions.map((q, i) => (
                        <div
                            key={i}
                            className="group flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mt-0.5">
                                <Message01Icon className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-gray-300 text-sm font-bold leading-snug group-hover:text-white transition-colors">
                                {q}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- NEW: Member Geography Card ---
export function MemberGeographyCard({ geography }: { geography: { country: string, count: number }[] }) {
    const total = geography.reduce((sum, g) => sum + g.count, 0);

    return (
        <Card className="rounded-[3rem] border-none shadow-premium bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full flex items-center gap-2">
                    <MapPinIcon className="w-3 h-3" />
                    MEMBER GEOGRAPHY
                </CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">By phone number</span>
            </CardHeader>
            <CardContent>
                {geography.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-bold text-center py-6">
                        No phone numbers detected — geography unavailable.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {geography.map((entry, i) => {
                            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                            return (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-2xl leading-none flex-shrink-0" role="img" aria-label={entry.country}>
                                        {getFlagEmoji(entry.country)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-black text-foreground truncate">{entry.country}</span>
                                            <span className="text-[10px] font-black text-muted-foreground ml-2 flex-shrink-0">{entry.count} member{entry.count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground w-8 text-right flex-shrink-0">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// --- NEW: Active Users Card ---
export function ActiveUsersCard({ contributors }: { contributors: { name: string, count: number }[] }) {
    const max = contributors[0]?.count || 1;

    return (
        <Card className="rounded-[3rem] border-none shadow-premium bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="font-heading text-xs font-black tracking-widest text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full flex items-center gap-2">
                    <UserIcon className="w-3 h-3" />
                    ACTIVE MEMBERS
                </CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">By message count</span>
            </CardHeader>
            <CardContent>
                {contributors.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-bold text-center py-6">No contributor data available.</p>
                ) : (
                    <div className="space-y-5">
                        {contributors.map((user, i) => {
                            const pct = Math.round((user.count / max) * 100);
                            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600', 'bg-muted/40', 'bg-muted/40'];
                            return (
                                <div key={i} className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-black text-primary">{initials || <UserIcon className="w-4 h-4" />}</span>
                                        </div>
                                        {i < 3 && (
                                            <div className={cn("absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white", rankColors[i])}>
                                                {i + 1}
                                            </div>
                                        )}
                                    </div>
                                    {/* Bar */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-black text-foreground truncate">{user.name}</span>
                                            <span className="text-[10px] font-black text-muted-foreground ml-2 flex-shrink-0">{user.count} msg{user.count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
