import { jsPDF } from "jspdf";

interface PdfData {
  tier: 1 | 2 | 3;
  tierLabel: string;
  headline: string;
  description: string;
  percentage: number;
  scores: { label: string; score: number }[];
  warnings: string[];
  strengths: string[];
  nextSteps: string[];
}

export function generateResultsPdf(data: PdfData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colours
  type RGB = [number, number, number];
  const ink: RGB = [19, 19, 19];
  const inkLight: RGB = [74, 74, 74];
  const inkMuted: RGB = [138, 138, 138];
  const cream: RGB = [247, 245, 241];
  const serpinYellow: RGB = [235, 242, 19];
  const tier1: RGB = [45, 138, 78];
  const tier2: RGB = [184, 134, 11];
  const tier3: RGB = [196, 69, 54];

  const tierColour: RGB =
    data.tier === 1 ? tier1 : data.tier === 2 ? tier2 : tier3;

  // ── Header bar ──
  doc.setFillColor(...cream);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setFontSize(9);
  doc.setTextColor(...inkMuted);
  doc.text("SERPIN", margin, 12);
  doc.text("From the Agent Discovery and Design Framework", pageWidth - margin, 12, {
    align: "right",
  });

  y = 30;

  // ── Tier badge ──
  doc.setFontSize(10);
  doc.setTextColor(...tierColour);
  doc.text(`Tier ${data.tier}: ${data.tierLabel}`, margin, y);
  doc.setTextColor(...inkMuted);
  doc.text(`Score: ${data.percentage}%`, margin + 50, y);
  y += 10;

  // ── Headline ──
  doc.setFontSize(20);
  doc.setTextColor(...ink);
  const headlineLines = doc.splitTextToSize(data.headline, contentWidth);
  doc.text(headlineLines, margin, y);
  y += headlineLines.length * 8 + 4;

  // ── Description ──
  doc.setFontSize(10);
  doc.setTextColor(...inkLight);
  const descLines = doc.splitTextToSize(data.description, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 10;

  // ── Score Breakdown ──
  doc.setFontSize(12);
  doc.setTextColor(...ink);
  doc.text("Your score breakdown", margin, y);
  y += 8;

  const barHeight = 5;
  const barMaxWidth = contentWidth - 50;
  const labelWidth = 45;

  data.scores.forEach((s) => {
    // Label
    doc.setFontSize(8);
    doc.setTextColor(...ink);
    doc.text(s.label, margin, y + 3.5);

    // Bar background
    const barX = margin + labelWidth;
    doc.setFillColor(...cream);
    doc.roundedRect(barX, y, barMaxWidth, barHeight, 2, 2, "F");

    // Bar fill
    const fillWidth = (s.score / 5) * barMaxWidth;
    const amber: RGB = [210, 160, 60];
    const barColour = s.score >= 4 ? tier1 : s.score >= 3 ? amber : tier3;
    doc.setFillColor(...barColour);
    if (fillWidth > 0) {
      doc.roundedRect(barX, y, fillWidth, barHeight, 2, 2, "F");
    }

    // Score text
    doc.setFontSize(8);
    doc.setTextColor(...inkMuted);
    doc.text(`${s.score}/5`, pageWidth - margin, y + 3.5, { align: "right" });

    y += barHeight + 3;
  });

  y += 5;

  // ── Areas to address ──
  if (data.warnings.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text("Areas to address", margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...inkLight);
    data.warnings.forEach((w) => {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }
      const lines = doc.splitTextToSize(`• ${w}`, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 3;
    });
    y += 5;
  }

  // ── Working in your favour ──
  if (data.strengths.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text("Working in your favour", margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...inkLight);
    data.strengths.forEach((s) => {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }
      const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 3;
    });
    y += 5;
  }

  // ── Next steps ──
  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(12);
  doc.setTextColor(...ink);
  doc.text("Recommended next steps", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(...inkLight);
  data.nextSteps.forEach((step, idx) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    const lines = doc.splitTextToSize(`${idx + 1}. ${step}`, contentWidth - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.5 + 3;
  });

  // ── Footer ──
  y = 280;
  doc.setDrawColor(...cream);
  doc.line(margin, y - 5, pageWidth - margin, y - 5);
  doc.setFontSize(8);
  doc.setTextColor(...inkMuted);
  doc.text(
    "This assessment is Question 1 of The Five Questions of Agent Discovery and Design",
    margin,
    y
  );
  doc.text("serpin.ai/agent-design", pageWidth - margin, y, {
    align: "right",
  });

  // ── Yellow accent line at top ──
  doc.setFillColor(...serpinYellow);
  doc.rect(0, 0, pageWidth, 2, "F");

  // Save
  doc.save("should-this-be-an-agent-results.pdf");
}
