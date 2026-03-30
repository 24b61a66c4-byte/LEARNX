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
  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

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
    const safeDisplayName = escapeHtml(displayName);
    const safeDisplayNameUpper = escapeHtml(displayName.toUpperCase());
    const safeExamTarget = escapeHtml(examTarget);
    const safeLaunchMode = escapeHtml(launchMode);

    // Generate SVG Chart bars for last 10 scores
    const chartData = history.slice(0, 10).reverse();
    const chartBars = chartData.map((item, idx) => {
      const x = idx * 40 + 10;
      const height = (item.scorePercent / 100) * 80;
      const y = 90 - height;
      return `<rect x="${x}" y="${y}" width="20" height="${height}" rx="4" fill="${item.scorePercent >= 80 ? "#0f766e" : "#d97706"}" />`;
    }).join("");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LearnX Progress Report - ${safeDisplayName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px;
    }
    .report-container { 
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 40px;
      position: relative;
    }
    .header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { color: #94a3b8; font-size: 14px; margin-top: 4px; font-weight: 600; }
    .brand-accent { position: absolute; top: 0; right: 0; width: 200px; height: 100%; background: linear-gradient(to left, rgba(15, 118, 110, 0.2), transparent); }
    
    .content { padding: 40px; }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .metric-card {
      background: #f8fafc;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
    }
    .metric-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
    .metric-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 8px; }
    
    .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: flex; items-center: center; gap: 10px; }
    .section-title::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
    
    .chart-container { background: #f8fafc; border-radius: 16px; padding: 30px; margin-bottom: 40px; border: 1px solid #f1f5f9; }
    
    .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    .table th { text-align: left; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #f1f5f9; }
    .table td { padding: 16px 12px; font-size: 14px; border-bottom: 1px solid #f8fafc; }
    .score-pill { font-weight: 800; color: #0f766e; }
    
    .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 40px; border-top: 1px solid #f1f5f9; }

    @media print {
      body { background: white; padding: 0; }
      .report-container { box-shadow: none; border: none; width: 100%; max-width: none; }
      .header { -webkit-print-color-adjust: exact; background: #0f172a !important; }
      .chart-container { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="brand-accent"></div>
      <h1>LearnX Progress Report</h1>
      <p>Student: ${safeDisplayNameUpper} &bull; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    
    <div class="content">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Drills</div>
          <div class="metric-value">${totalAttempts}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Mastery XP</div>
          <div class="metric-value">${totalXP}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Avg Accuracy</div>
          <div class="metric-value">${avgScore}%</div>
        </div>
      </div>

      <div class="section-title">Performance Trend</div>
      <div class="chart-container">
        <svg viewBox="0 0 400 100" style="width: 100%; height: 120px;">
          <line x1="0" y1="90" x2="400" y2="90" stroke="#e2e8f0" stroke-width="1" />
          ${chartBars}
        </svg>
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 10px; font-weight: 600; text-transform: uppercase;">Latest 10 practice sessions (Oldest to Newest)</p>
      </div>

      <div class="section-title">Study Profile</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Target Exam</div>
          <div style="margin-top: 8px; font-size: 16px; font-weight: 700; color: #0f172a;">${safeExamTarget}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Launch Mode</div>
          <div style="margin-top: 8px; font-size: 16px; font-weight: 700; color: #0f172a;">${safeLaunchMode}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Topics Practiced</div>
          <div class="metric-value">${distinctTopics}</div>
        </div>
      </div>

      <div class="section-title">Session Log</div>
      ${history.length > 0 ? `
      <table class="table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Accuracy</th>
            <th>Result</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
          ${history.slice(0, 10).map((item) => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml((item.topicId || item.subjectId).toUpperCase())}</td>
              <td class="score-pill">${item.scorePercent}%</td>
              <td style="color: #64748b;">${item.correctCount}/${item.totalCount} correct</td>
              <td style="font-weight: 800; color: #0f172a;">+${item.xpEarned}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ` : `
      <p style="margin-bottom: 40px; color: #64748b; font-size: 14px;">
        No practice history yet. Start one drill to populate your performance report.
      </p>
      `}

      ${notes.length > 0 ? `
        <div class="section-title">Knowledge Base</div>
        <p style="font-size: 14px; color: #475569; margin-bottom: 40px;">
          You have recorded <strong>${notes.length} concept notes</strong> in your personalized tutor library. 
          Keep documenting key insights to improve retrieval during exams.
        </p>
      ` : ""}
    </div>
    
    <div class="footer">
      Generated automatically by the LearnX AI Tutoring System &bull; g:/LEARNX
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  }

  return (
    <button
      className="group flex w-full items-center justify-between rounded-2xl bg-teal-50 px-6 py-4 font-bold text-teal-900 transition hover:bg-teal-100 active:scale-95"
      onClick={handleExport}
      type="button"
      aria-label="Export your progress as PDF"
    >
      EXPORT PROGRESS REPORT
      <span className="opacity-50 transition-transform group-hover:translate-y-px">⬇</span>
    </button>
  );
}

