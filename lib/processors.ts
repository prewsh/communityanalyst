import { subDays, isAfter, format, startOfHour, startOfWeek } from 'date-fns';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

/**
 * Tries to extract a date from a WhatsApp chat line.
 * Handles both US format (M/D/YY, H:MM AM/PM) and UK/NG format (DD/MM/YYYY, HH:mm).
 * Anchored to the start of the line to prevent false positives from message content.
 */
export function extractMessageDate(line: string): Date | null {
    // Pattern 1: US format - M/D/YY, H:MM AM/PM (e.g., "5/8/23, 2:04 PM - ...")
    // OR UK format - DD/MM/YYYY, HH:mm - (e.g., "27/02/2025, 14:30 - ...")
    const timestampRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\s*-/i;
    const match = line.match(timestampRegex);

    if (!match) return null;

    const part1 = parseInt(match[1]); // first number before /
    const part2 = parseInt(match[2]); // second number
    let year = parseInt(match[3]);
    let hour = parseInt(match[4]);
    const minute = parseInt(match[5]);
    const meridiem = match[7]?.toUpperCase();

    // Handle 2-digit years
    if (year < 100) {
        year += 2000;
    }

    // Sanity check: reject dates that are clearly out of range
    if (year < 2010 || year > 2030) return null;

    // Handle AM/PM
    if (meridiem === 'PM' && hour !== 12) {
        hour += 12;
    } else if (meridiem === 'AM' && hour === 12) {
        hour = 0;
    }

    // Auto-detect format:
    // If part1 > 12, it MUST be day-first (DD/MM format)
    // If part2 > 12, it MUST be month-first (MM/DD format, US)
    // If both ≤ 12, we default to US format (M/D/YY) since that's common in WhatsApp exports
    let day: number;
    let month: number;

    if (part1 > 12) {
        // Definitely DD/MM
        day = part1;
        month = part2 - 1;
    } else if (part2 > 12) {
        // Definitely MM/DD (US)
        month = part1 - 1;
        day = part2;
    } else {
        // Ambiguous - default to US format (M/D) since WhatsApp mobile exports commonly use this
        month = part1 - 1;
        day = part2;
    }

    // Validate the resulting date
    const date = new Date(year, month, day, hour, minute);
    if (isNaN(date.getTime())) return null;
    if (date.getMonth() !== month || date.getDate() !== day) return null; // overflow check

    return date;
}

/**
 * Extracts the community/group name from the chat export.
 * Looks for the "created group" pattern in WhatsApp exports.
 */
export function extractGroupName(content: string): string | null {
    const lines = content.split('\n');
    for (const line of lines) {
        // Pattern: "... - Group creator created group "Group Name"" or "... created group "..."
        const match = line.match(/created group[^\w"]*[""](.+?)[""]/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        // Also try: "... - Group creator created group Group Name" (without quotes)
        const fallbackMatch = line.match(/created group\s+(.+?)$/i);
        if (fallbackMatch && fallbackMatch[1]) {
            const name = fallbackMatch[1].trim().replace(/["""]/g, '');
            if (name.length > 1 && name.length < 100) {
                return name;
            }
        }
    }
    return null;
}

/**
 * Filters the chat content based on the selected time range.
 * Uses the LATEST date in the file as the reference point.
 */
export function filterMessagesByDate(content: string, range: TimeRange): string {
    if (range === 'all') return content;

    const lines = content.split('\n');

    // Find the LATEST date in the file (scan from end for efficiency)
    let latestDate: Date | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        const date = extractMessageDate(lines[i]);
        if (date) {
            latestDate = date;
            break;
        }
    }

    if (!latestDate) return content; // fallback: no parseable dates, return all

    const daysMap: Record<string, number> = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90,
    };

    const days = daysMap[range];
    const threshold = subDays(latestDate, days);

    const result: string[] = [];
    let keeping = false;

    for (const line of lines) {
        const date = extractMessageDate(line);

        if (date) {
            if (isAfter(date, threshold)) {
                keeping = true;
                result.push(line);
            } else {
                keeping = false;
            }
        } else {
            // Continuation lines (multi-line messages) are kept if we're in a valid block
            if (keeping) {
                result.push(line);
            }
        }
    }

    return result.join('\n');
}

/**
 * Returns the earliest and latest message dates in the content.
 */
export function getDateRange(content: string): { start: Date | null; end: Date | null } {
    const lines = content.split('\n');
    let start: Date | null = null;
    let end: Date | null = null;

    for (const line of lines) {
        const date = extractMessageDate(line);
        if (date) {
            if (!start) start = date;
            end = date;
        }
    }

    return { start, end };
}

/**
 * Calculates message volume over time for the activity graph.
 * Grouping strategy depends on the time range selected.
 */
export function calculateMessageVolume(content: string, range: TimeRange) {
    const lines = content.split('\n');
    const volumeMap = new Map<string, number>();

    for (const line of lines) {
        const date = extractMessageDate(line);
        if (date) {
            let key: string;
            if (range === '24h') {
                // Group by hour: "14:00"
                key = format(startOfHour(date), 'HH:mm');
            } else if (range === '7d') {
                // Group by day + time block: "Mon"
                key = format(date, 'EEE d MMM');
            } else if (range === '30d') {
                // Group by day: "5 Mar"
                key = format(date, 'd MMM');
            } else if (range === '90d') {
                // Group by week: "Week of Mar 3"
                key = format(startOfWeek(date), "'Wk' d MMM");
            } else {
                // All time: group by month "Mar 2025"
                key = format(date, 'MMM yyyy');
            }

            volumeMap.set(key, (volumeMap.get(key) || 0) + 1);
        }
    }

    return Array.from(volumeMap.entries()).map(([name, messages]) => ({
        name,
        messages
    }));
}

/**
 * Counts total messages in content.
 */
export function countMessages(content: string): number {
    return content.split('\n').filter(line => extractMessageDate(line) !== null).length;
}

/**
 * Identifies the top 5 contributors in the chat.
 */
export function getTopContributors(content: string): { name: string, count: number }[] {
    const lines = content.split('\n');
    const senderMap = new Map<string, number>();

    // WhatsApp format: "5/8/23, 2:04 PM - Name: Message" or "[DD/MM/YY, HH:mm] Name: Message"
    const senderRegex = /^[\d\/,\s:APM]+-\s+([^:]+):/;

    for (const line of lines) {
        // Skip system messages
        if (
            line.includes('Messages and calls are end-to-end encrypted') ||
            line.includes('created group') ||
            line.includes('joined using this group') ||
            line.includes('left') ||
            line.includes('added') ||
            line.includes('You were added') ||
            line.includes('<Media omitted>')
        ) {
            continue;
        }

        const match = line.match(senderRegex);
        if (match && match[1]) {
            const name = match[1].trim();
            // Skip if name looks like a system string
            if (name.length > 0 && name.length < 60) {
                senderMap.set(name, (senderMap.get(name) || 0) + 1);
            }
        }
    }

    return Array.from(senderMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

const COUNTRY_CODES: Record<string, string> = {
    '1': 'USA/Canada', '20': 'Egypt', '27': 'South Africa', '31': 'Netherlands',
    '32': 'Belgium', '33': 'France', '34': 'Spain', '39': 'Italy', '41': 'Switzerland',
    '44': 'UK', '46': 'Sweden', '47': 'Norway', '49': 'Germany', '51': 'Peru',
    '52': 'Mexico', '54': 'Argentina', '55': 'Brazil', '56': 'Chile', '57': 'Colombia',
    '60': 'Malaysia', '61': 'Australia', '62': 'Indonesia', '63': 'Philippines',
    '64': 'New Zealand', '65': 'Singapore', '66': 'Thailand', '7': 'Russia/Kazakhstan',
    '81': 'Japan', '82': 'South Korea', '84': 'Vietnam', '86': 'China', '90': 'Turkey',
    '91': 'India', '92': 'Pakistan', '93': 'Afghanistan', '94': 'Sri Lanka',
    '95': 'Myanmar', '98': 'Iran', '212': 'Morocco', '213': 'Algeria', '216': 'Tunisia',
    '218': 'Libya', '220': 'Gambia', '221': 'Senegal', '222': 'Mauritania',
    '223': 'Mali', '224': 'Guinea', '225': 'Ivory Coast', '226': 'Burkina Faso',
    '227': 'Niger', '228': 'Togo', '229': 'Benin', '230': 'Mauritius', '231': 'Liberia',
    '232': 'Sierra Leone', '233': 'Ghana', '234': 'Nigeria', '235': 'Chad',
    '236': 'Central African Republic', '237': 'Cameroon', '238': 'Cape Verde',
    '240': 'Equatorial Guinea', '241': 'Gabon', '242': 'Republic of the Congo',
    '243': 'DRC', '244': 'Angola', '245': 'Guinea-Bissau', '249': 'Sudan',
    '250': 'Rwanda', '251': 'Ethiopia', '252': 'Somalia', '253': 'Djibouti',
    '254': 'Kenya', '255': 'Tanzania', '256': 'Uganda', '257': 'Burundi',
    '258': 'Mozambique', '260': 'Zambia', '261': 'Madagascar', '263': 'Zimbabwe',
    '264': 'Namibia', '265': 'Malawi', '266': 'Lesotho', '267': 'Botswana',
    '268': 'Eswatini', '971': 'UAE', '972': 'Israel', '966': 'Saudi Arabia'
};

const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

/**
 * Extracts and maps country codes from sender numbers in a chat to approximate member geography.
 */
export function extractMemberGeography(content: string): { country: string, count: number }[] {
    const lines = content.split('\n');
    const geographyMap = new Map<string, number>();
    const uniqueNumbers = new Set<string>();

    const senderRegex = /^[\d\/,\s:APM]+-\s+([^:]+):/;

    for (const line of lines) {
        const match = line.match(senderRegex);
        if (match && match[1]) {
            const nameOrNumber = match[1].trim();
            if (nameOrNumber.startsWith('+')) {
                if (!uniqueNumbers.has(nameOrNumber)) {
                    uniqueNumbers.add(nameOrNumber);
                    const normalizedNumber = nameOrNumber.replace(/\D/g, '');
                    for (const code of sortedCodes) {
                        if (normalizedNumber.startsWith(code)) {
                            const countryName = COUNTRY_CODES[code];
                            geographyMap.set(countryName, (geographyMap.get(countryName) || 0) + 1);
                            break;
                        }
                    }
                }
            }
        }
    }

    return Array.from(geographyMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

// --- Internal: parse messages into structured objects for deeper analysis ---
interface ParsedMessage {
    sender: string;
    text: string;
}

function parseMessagesStructured(content: string): ParsedMessage[] {
    const lines = content.split('\n');
    const messages: ParsedMessage[] = [];
    let current: ParsedMessage | null = null;

    // Matches "5/8/23, 2:04 PM - Sender Name: text content"
    const msgRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\s*-\s+(.+?):\s*(.*)/i;

    for (const line of lines) {
        const match = line.match(msgRegex);
        if (match) {
            if (current) messages.push(current);
            const sender = match[1].trim();
            const text = match[2].trim();
            if (sender.length > 0 && sender.length < 80) {
                current = { sender, text };
            }
        } else if (current && line.trim().length > 0) {
            current.text += ' ' + line.trim();
        }
    }
    if (current) messages.push(current);
    return messages;
}

/**
 * Detects questions in the chat that received no reply from another member.
 * A question is considered unanswered if none of the next 5 messages come from
 * a different sender than the person who asked.
 */
export function detectUnansweredQuestions(content: string, maxResults = 10): string[] {
    const messages = parseMessagesStructured(content);
    const unanswered: string[] = [];

    const skipPatterns = ['<Media omitted>', 'http://', 'https://', 'omitted'];

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        if (!msg.text.includes('?')) continue;
        if (skipPatterns.some(p => msg.text.toLowerCase().includes(p.toLowerCase()))) continue;

        // Must be a real question (at least 15 meaningful characters)
        const plainText = msg.text.replace(/[^a-zA-Z0-9\s?]/g, '').trim();
        if (plainText.length < 15) continue;

        // Check next 5 messages — is there a reply from another person?
        const window = messages.slice(i + 1, i + 6);
        const hasReply = window.some(m => m.sender !== msg.sender);

        if (!hasReply) {
            const questionText = msg.text.trim();
            if (!unanswered.includes(questionText)) {
                unanswered.push(questionText);
            }
        }

        if (unanswered.length >= maxResults) break;
    }

    return unanswered;
}
