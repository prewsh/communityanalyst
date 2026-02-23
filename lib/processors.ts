import { startOfDay, subDays, isAfter, parse, format, startOfHour } from 'date-fns';

export type TimeRange = '24h' | '7d' | 'all';

/**
 * Tries to extract a date from a chat line.
 * Supports common WhatsApp and Telegram formats.
 */
export function extractMessageDate(line: string): Date | null {
    // Common formats:
    // [DD/MM/YYYY, HH:mm:ss]
    // DD/MM/YYYY, HH:mm -
    // [HH:mm] (Telegram often doesn't have date in every line, which is tricky. 
    // For this V2, we'll assume standard export formats that include date or handle simple cases)

    // Regex for DD/MM/YYYY
    // Improved regex to capture time as well for 24h volume
    const dateRegex = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4}).*?(\d{1,2}):(\d{2})/;
    const match = line.match(dateRegex);

    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Month is 0-indexed
        let year = parseInt(match[3]);
        const hour = parseInt(match[4]);
        const minute = parseInt(match[5]);

        // Handle 2-digit years
        if (year < 100) {
            year += 2000;
        }

        return new Date(year, month, day, hour, minute);
    }

    return null;
}

/**
 * Filters the chat content based on the selected time range.
 */
export function filterMessagesByDate(content: string, range: TimeRange): string {
    if (range === 'all') return content;

    const lines = content.split('\n');

    // 1. Find the LATEST date in the file (scanning from end to start is more efficient for chronological logs)
    let latestDate: Date | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        const date = extractMessageDate(lines[i]);
        if (date) {
            latestDate = date;
            break;
        }
    }

    // Default to now if no date found (fallback)
    const referenceDate = latestDate || new Date();

    let threshold: Date;
    if (range === '24h') {
        threshold = subDays(referenceDate, 1);
    } else if (range === '7d') {
        threshold = subDays(referenceDate, 7);
    } else {
        return content;
    }

    const result: string[] = [];

    // 2. Filter messages after the threshold
    // We scan forward to maintain order, but only keep those > threshold
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
            // Include continuation lines if we are currently keeping a message block
            if (keeping) {
                result.push(line);
            }
        }
    }

    return result.join('\n');
}

/**
 * Calculates message volume over time for the graph.
 */
export function calculateMessageVolume(content: string, range: TimeRange) {
    const lines = content.split('\n');
    const volumeMap = new Map<string, number>();

    // Determine grouping format
    // 24h -> Group by Hour (HH:00)
    // 7d / All -> Group by Day (DD/MM)
    const isHourly = range === '24h';

    for (const line of lines) {
        const date = extractMessageDate(line);
        if (date) {
            let key: string;
            if (range === '24h') {
                key = format(startOfHour(date), 'HH:mm');
            } else if (range === '7d') {
                key = format(startOfHour(date), 'EEE, HH:mm');
            } else {
                key = format(date, 'MMM yyyy');
            }

            volumeMap.set(key, (volumeMap.get(key) || 0) + 1);
        }
    }

    // Convert map to array and sort (simple sort by string key works for ISO, but for display formats we might need better logic if keys aren't chronological)
    // For simplicity validation, let's trust the map order or just return what we have. 
    // Ideally, we should fill in gaps (0 messages), but for now let's just return present data points.

    const data = Array.from(volumeMap.entries()).map(([name, messages]) => ({
        name,
        messages
    }));

    return data;
}

/**
 * Identifies the top 5 contributors in the chat.
 */
export function getTopContributors(content: string): { name: string, count: number }[] {
    const lines = content.split('\n');
    const senderMap = new Map<string, number>();

    // Regex to capture sender name
    // Matches:
    // 1. "DD/MM/YYYY, HH:mm - Sender: Message" (WhatsApp)
    // 2. "] Sender: Message" (Telegram/Other)
    // 3. "Sender: Message" (Generic)
    const senderRegex = /(?:- |] )([^:]+):/;

    for (const line of lines) {
        // Skip system messages
        if (line.includes('Messages and calls are end-to-end encrypted') ||
            line.includes('created group') ||
            line.includes('added') ||
            line.includes('left') ||
            line.includes('joined using this group\'s invite link')) {
            continue;
        }

        const match = line.match(senderRegex);
        if (match && match[1]) {
            const name = match[1].trim();
            senderMap.set(name, (senderMap.get(name) || 0) + 1);
        }
    }

    // Sort by count (descending) and take top 5
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

    // Matches "+234 123 4567" or "+441234567" before a colon.
    const senderRegex = /(?:- |] )([^:]+):/;

    const uniqueNumbers = new Set<string>();

    for (const line of lines) {
        const match = line.match(senderRegex);
        if (match && match[1]) {
            const nameOrNumber = match[1].trim();
            // WhatsApp often displays unsaved numbers with a leading '+'
            if (nameOrNumber.startsWith('+')) {
                // Ensure we only count each unique phone number once for geography
                if (!uniqueNumbers.has(nameOrNumber)) {
                    uniqueNumbers.add(nameOrNumber);

                    const normalizedNumber = nameOrNumber.replace(/\D/g, '');

                    for (const code of sortedCodes) {
                        if (normalizedNumber.startsWith(code)) {
                            const countryName = COUNTRY_CODES[code];
                            geographyMap.set(countryName, (geographyMap.get(countryName) || 0) + 1);
                            break; // Stop after longest match
                        }
                    }
                }
            }
        }
    }

    return Array.from(geographyMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Return top 5 countries
}
