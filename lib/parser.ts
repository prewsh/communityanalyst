export function parseChat(content: string): string {
    let clean = content;

    // 1. Remove WhatsApp System Messages
    const systemPatterns = [
        // Encryption notif
        /^[\d/,\.\s:-]+Messages and calls are end-to-end encrypted.*$/gm,
        // Group updates
        /^[\d/,\.\s:-]+.* joined using this group's invite link$/gm,
        /^[\d/,\.\s:-]+.* joined the group$/gm,
        /^[\d/,\.\s:-]+.* left the group$/gm,
        /^[\d/,\.\s:-]+.* changed the subject to .*$/gm,
        /^[\d/,\.\s:-]+.* changed the group description$/gm,
        /^[\d/,\.\s:-]+.* changed this group's icon$/gm,
    ];

    systemPatterns.forEach((pattern) => {
        clean = clean.replace(pattern, '');
    });

    // 2. Remove Metadata (Timestamp + Username)
    const metadataPatterns = [
        // WhatsApp iOS: [20/01/24, 14:02:10] User Name: Message Content
        /^\[\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4},? \d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?\] .*?: /gmi,

        // WhatsApp Android: 20/01/24, 14:02 - User Name: Message Content
        /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4},? \d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)? - .*?: /gmi, // Note: WhatsApp Android often uses " - " as separator

        // Telegram (Text Export): [14:02] User Name: Message Content
        /^\[\d{2}:\d{2}\] .*?: /gmi,
    ];

    metadataPatterns.forEach((pattern) => {
        clean = clean.replace(pattern, '');
    });

    // 3. Cleanup extra whitespace
    return clean
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n');
}

/**
 * Parses Telegram HTML export format.
 * Structure usually involves divs with classes:
 * - .message (container)
 * - .from_name (sender)
 * - .pull_right.date.details (timestamp)
 * - .text (message content)
 */
export function parseTelegramHtml(htmlContent: string): string {
    const messages: string[] = [];

    // We will use regex to find message blocks or extracting pieces.
    // Parsing HTML with regex is fragile but for this specific export format it's efficient enough 
    // and avoids adding heavy DOM libraries to the server runtime if not needed.
    // Telegram export format is relatively consistent.

    // Strategy: Split by "message" divs or find patterns.
    // Let's look for the pattern: 
    // <div class="pull_right date details" ... title="dd.mm.yyyy hh:mm:ss">...</div>
    // <div class="from_name" ...> Sender Name </div>
    // <div class="text"> Message Content </div>

    // Regex to match the whole message block might be too complex across newlines.
    // Let's try to extract parts.

    // Notes:
    // - Dates are often in `title="dd.mm.yyyy hh:mm:ss"` attribute of `.date`
    // - Sender is in `.from_name` text
    // - Text is in `.text`

    // Let's try a stateful line-by-line approach or global regex.
    // Given HTML structure, global regex for specific parts might start misaligning if we are not careful.
    // However, usually "from_name" is followed by "text".
    // "date" might be before or after.

    // Let's try to extract (Date, Sender, Message) tuples.
    // Telegram HTML structure (simplified):
    // <div class="message default clearfix" id="message123">
    //    <div class="pull_left date details" title="12.02.2024 14:13:35">14:13</div>
    //    <div class="from_name">User Name</div>
    //    <div class="text">Hello!</div>
    // </div>

    // If I split by `<div class="message`, I get chunks.
    const chunks = htmlContent.split(/<div class="message/);
    console.log(`[TelegramParser] Content length: ${htmlContent.length}. Chunks found: ${chunks.length}`);

    for (const chunk of chunks) {
        // Skip empty or header
        if (!chunk.includes('class="text"')) {
            // console.log('[TelegramParser] Skipping chunk without .text class');
            continue;
        }

        // Extract Date
        // Try more flexible date regex
        const dateMatch = chunk.match(/title="([\d\.\s:]+)"/);
        // Extract Sender
        const senderMatch = chunk.match(/class="from_name">\s*([^<]+)\s*<\/div>/);
        // Extract Text
        // Text might contain <br> or links. We should strip tags.
        const textMatch = chunk.match(/class="text">\s*([\s\S]*?)\s*<\/div>/);

        if (dateMatch && senderMatch && textMatch) {
            const dateTimeRaw = dateMatch[1]; // "12.02.2024 14:13:35"
            console.log(`[TelegramParser] Found message: ${dateTimeRaw} - ${senderMatch[1]}`);

            // Convert to [DD/MM/YYYY, HH:mm:ss]
            // Handle valid date parsing
            const [datePart, timePart] = dateTimeRaw.split(' ');
            if (!datePart || !timePart) continue;

            const formattedDate = `[${datePart.replace(/\./g, '/')}, ${timePart}]`;

            const sender = senderMatch[1].trim();

            // Clean text: replace <br> with \n, remove other tags
            let message = textMatch[1].trim();
            message = message.replace(/<br\s*\/?>/gi, '\n');
            message = message.replace(/<[^>]+>/g, ''); // Strip other tags
            message = message.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

            messages.push(`${formattedDate} ${sender}: ${message}`);
        } else {
            console.log('[TelegramParser] Failed to match parts:', {
                hasDate: !!dateMatch,
                hasSender: !!senderMatch,
                hasText: !!textMatch,
                chunkSnippet: chunk.substring(0, 100)
            });
        }
    }

    console.log(`[TelegramParser] Total parsed messages: ${messages.length}`);
    return messages.join('\n');
}
