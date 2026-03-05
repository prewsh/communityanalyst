'use client';

import React, { useState, useCallback } from 'react';
import { CloudUploadIcon, File02Icon, Cancel01Icon, Tick01Icon, Upload01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
        <div className="w-full">
            <div
                className={cn(
                    "relative group transition-all duration-500",
                    file ? "bg-white rounded-[2.5rem] p-8 premium-shadow" : ""
                )}
            >
                {file ? (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                        {/* Status Header */}
                        <div className="flex items-center justify-center gap-3 py-3 px-6 bg-green-50 rounded-full w-fit mx-auto border border-green-100 shadow-sm">
                            <Tick01Icon className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-600 tracking-tight">file uploaded</span>
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Upload01Icon className="w-3 h-3 text-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Your file</p>
                            <div className="flex items-center gap-4 p-6 bg-[#F8F7F4] rounded-2xl border border-border/50 w-full hover:border-primary/20 transition-colors">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                    <File02Icon className="w-6 h-6 text-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-foreground truncate">
                                        {file.name}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile();
                                    }}
                                    className="p-2 hover:bg-white rounded-full text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <Cancel01Icon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={removeFile}
                                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-foreground border border-border hover:bg-muted/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStartAnalysis}
                                    disabled={isAnalyzing}
                                    className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-black text-white hover:bg-black/90 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                                >
                                    {isAnalyzing ? "Analyzing..." : "Start Analyzing"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center p-16 transition-all duration-500 border-2 border-dashed rounded-[3rem] cursor-pointer bg-white/40",
                            isDragging ? "border-primary bg-primary/5 scale-[0.98]" : "border-border/60 hover:border-primary/40 hover:bg-white",
                            error ? "border-destructive/20 bg-destructive/5" : ""
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

                        <div className="p-5 bg-white rounded-3xl shadow-xl shadow-primary/5 mb-8 group-hover:scale-110 transition-transform duration-500">
                            <CloudUploadIcon className="w-10 h-10 text-primary" />
                        </div>

                        <h3 className="text-xl font-heading font-extrabold text-foreground mb-2">
                            Drag & drop your chat export here
                        </h3>
                        <p className="text-sm text-muted-foreground mb-8">
                            Supports .txt (WhatsApp) and .html (Telegram)
                        </p>

                        <button className="px-8 py-3 text-sm font-bold text-foreground bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                            Select File
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/5 p-4 rounded-2xl border border-destructive/10 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
