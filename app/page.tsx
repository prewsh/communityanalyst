'use client';

import { useState } from 'react';
import { FileUpload } from "@/components/file-upload";
import { AnalysisResult, ResultsDisplay } from "@/components/results-display";
import { TimeFilter } from "@/components/TimeFilter";
import { TimeRange } from "@/lib/processors";
import { SAMPLE_ANALYSIS_RESULT } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { AnalysisProgressModal } from "@/components/analysis-progress-modal";
import { BarChartIcon, Message02Icon, File01Icon } from "hugeicons-react";

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleAnalysis = async (file: File, range: TimeRange) => {
    setIsLoading(true);
    setShowProgress(true);
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
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
      // Keep progress modal visible for a moment for premium feel
      setTimeout(() => setShowProgress(false), 2000);
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
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V12H4C4 7.58172 7.58172 4 12 4ZM12 20C7.58172 20 4 16.4183 4 12H12V20ZM20 12C20 16.4183 16.4183 20 12 20V12H20ZM12 4C16.4183 4 20 7.58172 20 12H12V4Z" fill="currentColor" className="text-foreground" />
            </svg>
          </div>
          <span className="text-xl font-heading font-extrabold tracking-tight">Community Analyst</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase py-1 px-3 bg-muted/20 rounded-full">
            FOR COMMUNITY MANAGERS
          </span>
          <h2 className="text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-foreground max-w-2xl leading-[1.1]">
            Unlock Community Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get structured summaries, sentiment analysis, and engagement topics from your WhatsApp or Telegram chats in seconds.
          </p>
          {!results && !isLoading && (
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={() => setResults(SAMPLE_ANALYSIS_RESULT)}
                className="text-muted-foreground text-xs hover:text-primary hover:bg-transparent"
              >
                Or try with Sample Data
              </Button>
            </div>
          )}
        </div>

        {/* Upload Zone & Time Filter */}
        <div className="max-w-xl mx-auto space-y-8">
          <FileUpload onFileSelect={onFileSelected} isAnalyzing={isLoading} />

          {currentFile && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TimeFilter value={timeRange} onChange={handleTimeRangeChange} disabled={isLoading} />
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-20">
            <ResultsDisplay results={results} />
          </div>
        )}

        {/* Loading State Overlay would go here or inside FileUpload/Results */}

        {!results && !isLoading && (
          /* Features Grid */
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            <div className="p-8 bg-white/50 border border-border/50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChartIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">Smart Summaries</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Get executive-level overviews of channel discussions.</p>
            </div>

            <div className="p-8 bg-white/50 border border-border/50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Message02Icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">Topic Extraction</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Identify trending topics and user sentiment automatically.</p>
            </div>

            <div className="p-8 bg-white/50 border border-border/50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-muted/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <File01Icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-3">Content Drafts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Generate engagement posts and FAQs directly from chat data.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t border-border/50 mt-20">
        <p className="text-xs font-medium text-muted-foreground">&copy; {new Date().getFullYear()} Community Analyst. Powered by Gemini 1.5 Flash.</p>
      </footer>

      <AnalysisProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
      />
    </div>
  );
}
