import jsPDF from 'jspdf';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateAnalysisPDF(data: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('Community Analysis Report', margin, y);
    y += 15;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // Metrics
    if (data.healthScore !== undefined) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`Health Score: ${data.healthScore}/10`, margin, y);
        y += 10;
    }

    // Summary
    if (data.summary) {
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Executive Summary', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(60);
        const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
        doc.text(summaryLines, margin, y);
        y += (summaryLines.length * 7) + 10;
    }

    // Topics
    if (data.topics && data.topics.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Top Topics', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(60);
        data.topics.forEach((topic: string, i: number) => {
            const text = `${i + 1}. ${topic}`;
            doc.text(text, margin, y);
            y += 7;
        });
        y += 10;
    }

    // Unanswered Questions
    if (data.unansweredQuestions && data.unansweredQuestions.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Unanswered Questions', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(60);
        data.unansweredQuestions.forEach((q: string) => {
            const lines = doc.splitTextToSize(`• ${q}`, contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * 7);
        });
        y += 10;
    }

    // Engagement Post
    if (data.engagementPost) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Draft Engagement Post', margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.setFont(doc.getFont().fontName, 'italic');
        // Ensure string is passed
        const postLines = doc.splitTextToSize(data.engagementPost || "", contentWidth);
        doc.text(postLines, margin, y);
        doc.setFont(doc.getFont().fontName, 'normal');
        y += (postLines.length * 7) + 10;
    }

    // FAQs
    if (data.faqs && data.faqs.length > 0) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Frequent Questions', margin, y);
        y += 10;

        data.faqs.forEach((faq: { question: string, answer: string }) => {
            if (y > 270) { doc.addPage(); y = 20; }

            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont(doc.getFont().fontName, 'bold');
            const qLines = doc.splitTextToSize(`Q: ${faq.question || ""}`, contentWidth);
            doc.text(qLines, margin, y);
            y += (qLines.length * 6);

            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.setFont(doc.getFont().fontName, 'normal');
            const aLines = doc.splitTextToSize(`A: ${faq.answer || ""}`, contentWidth);
            doc.text(aLines, margin, y);
            y += (aLines.length * 6) + 5;
        });
    }

    doc.save('community-analysis-report.pdf');
}
