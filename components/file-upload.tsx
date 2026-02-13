'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
    onAnalysisComplete: (data: any) => void;
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt') || droppedFile.name.endsWith('.json')) {
                setFile(droppedFile);
            } else {
                alert('Please upload a .txt or .json file');
            }
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }, []);

    const removeFile = useCallback(() => {
        setFile(null);
    }, []);

    const analyzeFile = async () => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            onAnalysisComplete(data);
        } catch (error) {
            console.error(error);
            alert('Failed to analyze the file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardContent className="p-6">
                {!file ? (
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                            isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".txt,.json"
                            onChange={handleFileInput}
                        />
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-full">
                                <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    TXT or JSON (Telegram/WhatsApp exports)
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <button
                            onClick={analyzeFile}
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing Chat...
                                </>
                            ) : (
                                'Analyze Chat'
                            )}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
