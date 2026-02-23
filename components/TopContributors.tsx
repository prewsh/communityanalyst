import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Medal } from 'lucide-react';

interface Contributor {
    name: string;
    count: number;
}

interface TopContributorsProps {
    contributors?: Contributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
    if (!contributors || contributors.length === 0) {
        return (
            <Card className="h-full">
                <CardContent className="py-10 text-center text-gray-500">
                    No contributor data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {contributors.map((contributor, i) => (
                        <li key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                                    ${i === 0
                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'}
                                `}>
                                    {i === 0 ? <Medal className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`font-medium truncate ${i === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {contributor.name}
                                </span>
                            </div>
                            <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full group-hover:bg-gray-200 transition-colors">
                                {contributor.count} msgs
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
