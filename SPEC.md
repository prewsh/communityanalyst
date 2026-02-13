Project name: Coomunity Analyser

🎯 Goal
A web application for community managers to upload Telegram/WhatsApp chat exports and receive structured AI-generated insights using Gemini 3 Flash.

🛠 Tech Stack
Frontend/Backend: Next.js 15 (App Router)

Styling: Tailwind CSS + Shadcn UI

AI: Google Gemini API (Generative AI SDK)

Deployment: Vercel

📂 File Structure
Plaintext
/root
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts  # Main AI & Chunking Logic
│   ├── components/       # UI Cards, Upload Zone, Results
│   └── page.tsx          # Main Dashboard
├── lib/
│   ├── parser.ts         # Regex for Chat Cleaning
│   └── gemini.ts         # Gemini SDK Config
└── public/               # Static assets & export guides
🏗 Requirements & Logic
1. File Parsing (lib/parser.ts)
Input: Raw .txt or .json (Telegram/WhatsApp).

Logic: - Strip timestamps (e.g., [10/12/23, 14:02:10]).

Strip system messages (e.g., "User joined the group").

Preserve: Username: Message Content.

2. AI Processing (app/api/analyze/route.ts)
Chunking: Split cleaned text into chunks of 8,000 characters.

Map Step: Send each chunk to Gemini with the "Analyst Prompt."

Reduce Step: If multiple chunks exist, send all summaries back to Gemini to produce one final "Master Analysis."

3. The Prompt (System Role)
"You are an expert AI Community Analyst. Analyze the provided chat transcript and return a JSON object with:

summary: 200-word executive overview.

topics: Array of top 5 discussion points.

faqs: Array of objects {question, answer}.

engagementPost: A draft post for LinkedIn/Twitter based on the chat.

followUp: 3-5 actionable next steps for the manager."

4. UI/UX Features
Upload: Drag-and-drop zone.

Loading State: Progress bar or "AI is thinking" pulse.

Results: - Summary in a featured card.

FAQs in a Shadcn Accordion.

"Copy" button for the Engagement Post.

✅ Success Criteria
User can upload a 2MB text file without the app crashing.

UI renders clear, readable sections for all 5 requested outputs.

No "hallucinated" data—insights must be grounded in the uploaded text.

🕒 Sprint Instructions (Vibe Coder Mode)
Scaffold: Build the Next.js shell first.

Logic: Implement the /api/analyze route with chunking.

Integration: Connect the frontend upload to the backend.

Style: Apply professional "Community Manager" aesthetic using Tailwind.