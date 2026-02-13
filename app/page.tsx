'use client';

import { useState } from 'react';
import { FileUpload } from "@/components/file-upload";
import { AnalysisResults } from "@/components/results-display";

export default function Home() {
  const [results, setResults] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Community Analyser
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-blue-600 transition-colors">History</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-2 mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Upload Chat Export
          </h2>
          <p className="text-gray-500 text-lg">
            Get structured insights from your Telegram or WhatsApp groups in seconds.
          </p>
        </div>

        {/* Upload Zone */}
        <FileUpload onAnalysisComplete={setResults} />

        {/* Results Section */}
        {results ? (
          <AnalysisResults data={results} />
        ) : (
          /* Features Grid (Visual placeholder before results) */
          <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Summaries</h3>
              <p className="text-sm text-gray-500">Get executive-level overviews of channel discussions.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Topic Extraction</h3>
              <p className="text-sm text-gray-500">Identify trending topics and user sentiment automatically.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Drafts</h3>
              <p className="text-sm text-gray-500">Generate engagement posts and FAQs directly from chat data.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Community Analyser. Powered by Gemini 1.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
}
