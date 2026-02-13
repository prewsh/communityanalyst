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
