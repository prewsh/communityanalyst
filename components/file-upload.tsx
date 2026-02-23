'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, File, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isAnalyzing: boolean;
}

export function FileUpload({ onFileSelect, isAnalyzing }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            if (droppedFile.type === 'text/plain' || droppedFile.type === 'text/html' || droppedFile.name.endsWith('.txt') || droppedFile.name.endsWith('.json') || droppedFile.name.endsWith('.html')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a .txt, .html or .json file');
                toast.error('Invalid file type', { description: 'Please upload a .txt, .html or .json file.' });
            }
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'text/plain' || selectedFile.type === 'text/html' || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.html')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a .txt, .html or .json file');
                toast.error('Invalid file type', { description: 'Please upload a .txt, .html or .json file.' });
            }
        }
    }, []);

    const removeFile = useCallback(() => {
        setFile(null);
        setError(null);
    }, []);

    const handleStartAnalysis = () => {
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-dashed border-2 bg-muted/30">
            <CardContent className="p-8">
                <div
                    className={cn(
                        "flex flex-col items-center justify-center p-10 transition-colors border-2 border-dashed rounded-xl cursor-pointer",
                        isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50",
                        error ? "border-red-200 bg-red-50" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        accept=".txt,.json,.html"
                        onChange={handleFileInput}
                    />

                    {file ? (
                        <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm border border-border w-full max-w-md">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <File className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile();
                                }}
                                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-card rounded-full shadow-sm mb-4">
                                <UploadCloud className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-lg font-heading text-foreground mb-1">
                                Drag & drop your chat export here
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Supports .txt (WhatsApp) and .html (Telegram)
                            </p>
                            <button className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                                Select File
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {file && !error && (
                    <button
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing}
                        className="w-full mt-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Start Analysis'
                        )}
                    </button>
                )}
            </CardContent>
        </Card>
    );
}
