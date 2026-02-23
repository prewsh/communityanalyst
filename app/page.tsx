'use client';

import { useState } from 'react';
import { FileUpload } from "@/components/file-upload";
import { AnalysisResults } from "@/components/results-display";
import { TimeFilter } from "@/components/TimeFilter";
import { TimeRange } from "@/lib/processors";
import { SAMPLE_ANALYSIS_RESULT } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = async (file: File, range: TimeRange) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timeRange', range);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze file');
      }

      const data = await response.json();
      setResults(data);
      // Only show success toast if it's the initial upload or manual trigger, 
      // maybe skip for silent updates? For now showing it is fine or we can match FileUpload behavior.
    } catch (err: unknown) {
      console.error(err);
      // toast handled in FileUpload for initial, but here we might need it for re-analysis
      // Let's rely on FileUpload for initial and handles errors here for updates
    } finally {
      setIsLoading(false);
    }
  };

  const onFileSelected = async (file: File) => {
    setCurrentFile(file);
    // Initial analysis
    await handleAnalysis(file, timeRange);
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    if (currentFile) {
      handleAnalysis(currentFile, newRange);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-heading font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Community Analyser
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="hover:text-primary transition-colors">History</a>
            <a href="#" className="hover:text-primary transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-4 mb-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-sm">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-heading font-extrabold tracking-tight text-foreground sm:text-5xl">
            Unlock Community Insights
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Get structured summaries, sentiment analysis, and engagement topics from your WhatsApp or Telegram chats in seconds.
          </p>
          {!results && !isLoading && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => setResults(SAMPLE_ANALYSIS_RESULT)}
                className="text-primary border-primary/20 hover:bg-primary/5"
              >
                Or try with Sample Data
              </Button>
            </div>
          )}
        </div>

        {/* Time Filter */}
        <TimeFilter value={timeRange} onChange={handleTimeRangeChange} disabled={isLoading} />

        {/* Upload Zone */}
        {/* We pass a stripped down handler or modify FileUpload to just notify selection. 
            For now, let's keep FileUpload UI but override its internal analyze logic by passing a custom handler if possible, 
            or better, refactor FileUpload to take `onFileSelect` instead of `onAnalysisComplete`. 
            I will assume I am refactoring FileUpload next. */}
        <FileUpload onFileSelect={onFileSelected} isAnalyzing={isLoading} />

        {/* Results Section */}
        {results ? (
          <AnalysisResults data={results} isLoading={isLoading} />
        ) : (
          isLoading && (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium">Analyzing chat data...</p>
              </div>
            </div>
          )
        )}

        {!results && !isLoading && (
          /* Features Grid (Visual placeholder before results) */
          <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
            <div className="p-6 bg-card rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Smart Summaries</h3>
              <p className="text-sm text-muted-foreground">Get executive-level overviews of channel discussions.</p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Topic Extraction</h3>
              <p className="text-sm text-muted-foreground">Identify trending topics and user sentiment automatically.</p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Content Drafts</h3>
              <p className="text-sm text-muted-foreground">Generate engagement posts and FAQs directly from chat data.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Community Analyser. Powered by Gemini 1.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
}
