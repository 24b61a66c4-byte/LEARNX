"use client";

import { PRACTICE_HISTORY_KEY, TOPIC_NOTES_KEY } from "@/lib/constants";
import { readLocalStorage } from "@/lib/storage";
import { PracticeResult, StudyNote } from "@/lib/types";

interface ExportProgressProps {
  displayName: string;
  examTarget?: string;
  launchMode?: string;
}

export function ExportProgress({
  displayName,
  examTarget = "Semester Exam",
  launchMode = "Lesson",
}: ExportProgressProps) {
  function handleExport() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export your progress.");
      return;
    }

    const history = readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []);
    const notes = readLocalStorage<StudyNote[]>(TOPIC_NOTES_KEY, []);

    const totalAttempts = history.length;
    const totalXP = history.reduce((sum, item) => sum + item.xpEarned, 0);
    const avgScore =
      history.length > 0
        ? Math.round(history.reduce((sum, item) => sum + item.scorePercent, 0) / history.length)
        : 0;
    const distinctTopics = new Set(history.map((item) => item.topicId).filter(Boolean)).size;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LearnX Progress Report - ${displayName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }
    .page { 
      max-width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 1in;
      background: white;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .page { margin: 0; padding: 1in; }
      .page-break { page-break-after: always; }
    }
    
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .header h1 { font-size: 2rem; color: #0f172a; }
    .header p { color: #64748b; font-size: 0.9rem; }
    
    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 0.5rem;
      background: #f8fafc;
    }
    .metric-label { font-size: 0.85rem; color: #64748b; font-weight: 500; }
    .metric-value { font-size: 1.75rem; font-weight: bold; color: #0f172a; margin-top: 0.25rem; }
    
    .section {
      margin-bottom: 1.5rem;
    }
    .section h2 {
      font-size: 1.25rem;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
      margin-bottom: 0.75rem;
    }
    
    .content-list {
      font-size: 0.9rem;
      line-height: 1.8;
    }
    .content-list li {
      margin-bottom: 0.5rem;
      margin-left: 1.25rem;
    }
    
    .study-defaults {
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .study-defaults strong { color: #0f172a; }
    
    .footer {
      text-align: center;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    
    .empty-state {
      color: #64748b;
      font-style: italic;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>LearnX Progress Report</h1>
      <p>Student: <strong>${displayName}</strong> | Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Practice Sessions</div>
        <div class="metric-value">${totalAttempts}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total XP Earned</div>
        <div class="metric-value">${totalXP}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Average Score</div>
        <div class="metric-value">${avgScore}%</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Study Profile</h2>
      <div class="study-defaults">
        <strong>Target Exam:</strong> ${examTarget}
      </div>
      <div class="study-defaults">
        <strong>Launch Mode:</strong> ${launchMode}
      </div>
      <div class="study-defaults">
        <strong>Topics Practiced:</strong> ${distinctTopics} unique topic${distinctTopics === 1 ? "" : "s"}
      </div>
    </div>
    
    ${
      history.length > 0
        ? `<div class="section">
      <h2>Recent Practice Sessions</h2>
      <ul class="content-list">
        ${history
          .slice(0, 8)
          .map(
            (item) =>
              `<li><strong>${item.scorePercent}%</strong> on ${item.topicId ? item.topicId : item.subjectId.toUpperCase()} (${item.correctCount}/${item.totalCount} correct) +${item.xpEarned} XP</li>`,
          )
          .join("")}
      </ul>
    </div>`
        : `<div class="section">
      <p class="empty-state">No practice history yet. Start drilling to see your progress here.</p>
    </div>`
    }
    
    ${
      notes.length > 0
        ? `<div class="section">
      <h2>Study Notes (${notes.length} total)</h2>
      <p class="empty-state">Check LearnX app for detailed notes.</p>
    </div>`
        : ""
    }
    
    <div class="footer">
      <p>This report was generated by LearnX. Keep practicing to improve your score!</p>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  return (
    <button
      className="button-secondary w-full"
      onClick={handleExport}
      type="button"
      aria-label="Export your progress as PDF"
    >
      Export Progress Report
    </button>
  );
}
