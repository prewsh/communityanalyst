export const SAMPLE_ANALYSIS_RESULT = {
    summary: "This community is highly engaged, primarily discussing tech trends and project management. The sentiment is generally positive, with users actively helping each other troubleshooting coding issues. There's a strong interest in the upcoming 'V2' release.",
    healthScore: 8.5,
    sentiment: {
        positive: 65,
        neutral: 25,
        negative: 10
    },
    topics: [
        "Next.js 15 Features",
        "Supabase Auth Integration",
        "Tailwind CSS Tricks",
        "Vercel Deployment Errors",
        "Community Meetup Planning"
    ],
    unansweredQuestions: [
        "Has anyone tried the new React Compiler?",
        "What is the best way to handle file uploads in Server Actions?",
        "Is there a discount code for the annual plan?"
    ],
    faqs: [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking 'Forgot Password' on the login screen."
        },
        {
            question: "When is the next community call?",
            answer: "Community calls are held every Friday at 4 PM EST on Discord."
        }
    ],
    engagementPost: "🚀 Hey everyone! We noticed a lot of great questions about Next.js 15 this week. \n\nWe're compiling a list of top tips shared in the chat. Reply to this thread with your favorite new feature! \n\nAlso, huge shoutout to @alex for helping so many people with Supabase auth. Keep it up! 👏",
    followUp: [
        "Schedule a deep-dive session on React Compiler",
        "Update documentation for Server Actions",
        "Announce the community meetup date"
    ],
    volumeData: [
        { name: 'Monday', messages: 120 },
        { name: 'Tuesday', messages: 150 },
        { name: 'Wednesday', messages: 180 },
        { name: 'Thursday', messages: 200 },
        { name: 'Friday', messages: 250 },
        { name: 'Saturday', messages: 100 },
        { name: 'Saturday', messages: 100 },
        { name: 'Sunday', messages: 80 }
    ],
    topContributors: [
        { name: "Alex (Supabase Expert)", count: 42 },
        { name: "SarahDev", count: 35 },
        { name: "NextJS_Fan", count: 28 },
        { name: "Rohan", count: 19 },
        { name: "NewbieCoder", count: 12 }
    ]
};
