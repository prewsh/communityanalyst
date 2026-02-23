import { NextResponse } from 'next/server';
import { parseChat, parseTelegramHtml } from '@/lib/parser';
import { filterMessagesByDate, TimeRange, calculateMessageVolume, getTopContributors, extractMemberGeography } from '@/lib/processors';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const text = await file.text();

        const timeRange = (formData.get('timeRange') as TimeRange) || '24h';

        // 1. Parser
        let rawText = '';
        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            rawText = parseTelegramHtml(text);
        } else {
            rawText = parseChat(text);
        }

        // 2. Filter for Analysis Context
        let cleanText = filterMessagesByDate(rawText, timeRange);

        // 3. Calculate Volume (using filtered or raw depending on requirement - let's use filtered to match context)
        const volumeData = calculateMessageVolume(cleanText, timeRange);

        // Limit size for Free Tier AFTER filtering
        // CRITICAL UPDATE: Take the LAST 15,000 characters to ensure we analyze the MOST RECENT context
        // instead of the oldest.
        if (cleanText.length > 50000) {
            cleanText = cleanText.slice(-50000);
            // Optional: trim start up to the first newline to avoid cut-off lines
            const firstNewline = cleanText.indexOf('\n');
            if (firstNewline !== -1) cleanText = cleanText.substring(firstNewline + 1);
        }

        if (!cleanText || cleanText.length === 0) {
            return NextResponse.json({ error: 'Parsed text is empty' }, { status: 400 });
        }

        console.log("Sending single request to Gemini...");

        // 2. Simple Single-Prompt Analysis
        const prompt = `
            You are an expert Community Analyst. Analyze this chat from a community whatsapp group and return ONLY a JSON object.
            
            Structure:
            {
                "summary": "200-word overview",
                "healthScore": 8,
                "sentiment": { "positive": 40, "neutral": 50, "negative": 10 },
                "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
                "unansweredQuestions": ["Q1?", "Q2?"],
                "faqs": [{"question": "Q1", "answer": "A1"}],
                "engagementPost": "Social media draft",
                "followUp": ["Action 1", "Action 2"]
            }

            Chat:
            ${cleanText}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 3. Extract JSON from potential Markdown formatting
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI did not return valid JSON. Check terminal for raw response.");
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Merge volume data and top contributors
        const topContributors = getTopContributors(cleanText);
        const memberGeography = extractMemberGeography(cleanText);
        return NextResponse.json({ ...analysis, volumeData, topContributors, memberGeography });

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error('SERVER CRASH DETAILS:', errorMsg);

        // Handle Rate Limiting specifically for Free Tier
        if (errorMsg.includes("429")) {
            return NextResponse.json(
                { error: "Rate limit hit. Please wait 60 seconds before trying again." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to analyze chat', details: error instanceof Error ? error.message : "Reason unknown" },
            { status: 500 }
        );
    }
}