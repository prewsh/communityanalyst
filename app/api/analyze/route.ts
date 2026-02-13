import { NextResponse } from 'next/server';
import { parseChat } from '@/lib/parser';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const text = await file.text();

        // 1. Force a small text size to stay within Free Tier limits
        const cleanText = parseChat(text).substring(0, 10000);

        if (!cleanText || cleanText.length === 0) {
            return NextResponse.json({ error: 'Parsed text is empty' }, { status: 400 });
        }

        console.log("Sending single request to Gemini...");

        // 2. Simple Single-Prompt Analysis
        const prompt = `
            You are an expert AI Community Analyst. Analyze this chat and return ONLY a JSON object.
            
            Structure:
            {
                "summary": "200-word overview",
                "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
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
        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error('SERVER CRASH DETAILS:', error.message);

        // Handle Rate Limiting specifically for Free Tier
        if (error.message.includes("429")) {
            return NextResponse.json(
                { error: "Rate limit hit. Please wait 60 seconds before trying again." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to analyze chat', details: error.message },
            { status: 500 }
        );
    }
}