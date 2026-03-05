import { NextResponse } from 'next/server';
import { parseChat, parseTelegramHtml } from '@/lib/parser';
import {
    filterMessagesByDate,
    TimeRange,
    calculateMessageVolume,
    getTopContributors,
    extractMemberGeography,
    extractGroupName,
    getDateRange,
    countMessages,
    detectUnansweredQuestions
} from '@/lib/processors';
import { model } from '@/lib/gemini';
import { format } from 'date-fns';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB cap
const MAX_CONTEXT_CHARS = 500_000; // gemini-2.5-pro has a 1M token window; 500k chars is safe

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    '24h': 'last 24 hours',
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    '90d': 'last 90 days',
    'all': 'all time',
};

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: 'File exceeds 10MB limit. Please export a smaller time range from WhatsApp.' }, { status: 413 });
        }

        const text = await file.text();
        const timeRange = (formData.get('timeRange') as TimeRange) || '7d';

        // 1. Parse the raw file
        let rawText = '';
        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            rawText = parseTelegramHtml(text);
        } else {
            rawText = parseChat(text);
        }

        // 2. Extract metadata from the FULL unfiltered chat (geography is lifetime, not time-ranged)
        const groupName = extractGroupName(rawText);
        const memberGeography = extractMemberGeography(rawText);
        const fullDateRange = getDateRange(rawText);

        // 3. Filter by selected time range
        const filteredText = filterMessagesByDate(rawText, timeRange);

        // Active users ranked by the FILTERED window (matches selected time range)
        const topContributors = getTopContributors(filteredText);
        // 4. Calculate volume from the filtered window
        const volumeData = calculateMessageVolume(filteredText, timeRange);
        const messageCount = countMessages(filteredText);

        // 5. Truncate if needed (paid tier: 500k chars)
        let analysisText = filteredText;
        if (analysisText.length > MAX_CONTEXT_CHARS) {
            // Take the MOST RECENT portion
            analysisText = analysisText.slice(-MAX_CONTEXT_CHARS);
            const firstNewline = analysisText.indexOf('\n');
            if (firstNewline !== -1) analysisText = analysisText.substring(firstNewline + 1);
        }

        if (!analysisText || analysisText.length === 0) {
            return NextResponse.json(
                { error: `No messages found in the selected time range (${TIME_RANGE_LABELS[timeRange]}). Try selecting a wider range like "All Time".` },
                { status: 400 }
            );
        }

        // 6. Build rich context for the prompt
        const timeRangeLabel = TIME_RANGE_LABELS[timeRange];
        const communityLabel = groupName ? `"${groupName}"` : 'this community';
        const dateRangeFormatted = fullDateRange.start && fullDateRange.end
            ? `from ${format(fullDateRange.start, 'd MMM yyyy')} to ${format(fullDateRange.end, 'd MMM yyyy')}`
            : 'date range unknown';

        const prompt = `You are a senior community analyst preparing a briefing for a community manager. Your tone is professional, concise, and human — like a trusted advisor, not a chatbot.

## Context
- Community: ${communityLabel}
- Chat data spans: ${dateRangeFormatted}
- Analysis window: ${timeRangeLabel}
- Messages in this window: ${messageCount}
${topContributors.length > 0 ? `- Top contributors: ${topContributors.map(c => `${c.name} (${c.count} msgs)`).join(', ')}` : ''}

## Instructions
Analyse the chat messages below and return ONLY a valid JSON object — no markdown, no preamble, no explanation.

Return this exact structure:
{
  "summary": "A 2-3 paragraph executive briefing in plain, professional English. Start with the most important observation or trend. Reference the community name and time period naturally. Do NOT use bullet points, numbered lists, or phrases like 'it is worth noting', 'delve into', 'I analyzed'. Write as a human expert would — direct, insightful, and grounded in what actually happened in the chat.",
  "healthScore": <integer from 1 to 10 reflecting engagement quality, response rate, and sentiment balance>,
  "sentiment": { "positive": <integer 0-100>, "neutral": <integer 0-100>, "negative": <integer 0-100> },
  "topics": ["<5 specific topics actively discussed in the chat — use the actual words/phrases used>"],
  "unansweredQuestions": ["<questions posted in the chat that received no or very few replies>"],
  "faqs": [{"question": "<a question that was actually asked and answered>", "answer": "<the answer given in the chat, summarised in 1-2 sentences>"}],
  "engagementPost": "<A WhatsApp community message draft. Start with a relevant emoji. Informal but professional. 3-4 sentences. Reference real topics from the chat. Ready to copy-paste.>",
  "followUp": ["<3-5 specific, actionable next steps for the community manager based on what you observed>"]
}

## Chat Messages
${analysisText}`;

        console.log(`Analysing "${communityLabel}" — ${messageCount} messages (${timeRangeLabel})`);

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response (handles cases where model adds markdown fences)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Raw Gemini response:', responseText.substring(0, 500));
            throw new Error('AI did not return valid JSON.');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Programmatic unanswered question detection on the filtered window
        const detectedUnansweredQuestions = detectUnansweredQuestions(filteredText);

        return NextResponse.json({
            ...analysis,
            volumeData,
            topContributors,
            memberGeography,
            detectedUnansweredQuestions,
            meta: {
                groupName,
                timeRange,
                messageCount,
                dateRange: {
                    start: fullDateRange.start?.toISOString() ?? null,
                    end: fullDateRange.end?.toISOString() ?? null
                }
            }
        });

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Analysis error:', errorMsg);

        if (errorMsg.includes('429')) {
            return NextResponse.json(
                { error: 'Rate limit reached. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Analysis failed. Please try again.', details: errorMsg },
            { status: 500 }
        );
    }
}