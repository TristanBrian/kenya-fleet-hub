import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportData {
  title: string;
  generatedBy: string;
  dateRange?: string;
  summary: {
    label: string;
    value: string;
    subtext?: string;
  }[];
  sections: {
    title: string;
    type: "table" | "text" | "metrics";
    data: any;
  }[];
}

// Safiri Smart Fleet Colors (Kenyan theme)
const COLORS = {
  primary: [0, 0, 0] as [number, number, number],
  accent: [200, 16, 46] as [number, number, number],
  success: [0, 100, 0] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  muted: [128, 128, 128] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export const generateFleetReport = async (data: ReportData): Promise<void> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Accent stripe (Kenyan flag colors)
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 45, pageWidth, 3, "F");
  doc.setFillColor(...COLORS.success);
  doc.rect(0, 48, pageWidth, 2, "F");

  // Company name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SAFIRI SMART FLEET", margin, 25);

  // Tagline
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Fleet Management & Control System | Kenya", margin, 33);

  // Report title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.title.toUpperCase(), pageWidth - margin, 25, { align: "right" });

  // Generated date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  doc.text(`Generated: ${now.toLocaleDateString("en-KE", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`, pageWidth - margin, 33, { align: "right" });

  yPos = 60;

  // Report info
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.text(`Prepared by: ${data.generatedBy}`, margin, yPos);
  if (data.dateRange) {
    doc.text(`Period: ${data.dateRange}`, pageWidth - margin, yPos, { align: "right" });
  }

  yPos += 15;

  // Executive Summary box
  const summaryHeight = 10 + (Math.ceil(data.summary.length / 4) * 25);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos - 5, pageWidth - (margin * 2), summaryHeight, 3, 3, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE SUMMARY", margin + 5, yPos + 3);

  yPos += 12;

  // Summary metrics grid
  const metricsPerRow = 4;
  const metricWidth = (pageWidth - (margin * 2) - 20) / metricsPerRow;

  data.summary.forEach((metric, index) => {
    const col = index % metricsPerRow;
    const row = Math.floor(index / metricsPerRow);
    const x = margin + 5 + (col * metricWidth);
    const y = yPos + (row * 22);

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, x, y);

    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, x, y + 6);

    if (metric.subtext) {
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.setFont("helvetica", "normal");
      doc.text(metric.subtext, x, y + 11);
    }
  });

  yPos += 15 + (Math.ceil(data.summary.length / metricsPerRow) * 22);

  // Sections
  for (const section of data.sections) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(section.title.toUpperCase(), margin + 3, yPos + 5.5);

    yPos += 12;

    if (section.type === "table" && section.data.head && section.data.body) {
      autoTable(doc, {
        startY: yPos,
        head: section.data.head,
        body: section.data.body,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: COLORS.success,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        theme: "grid",
      });
      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
      yPos = finalY + 10;
    } else if (section.type === "text") {
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(section.data, pageWidth - (margin * 2));
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 10;
    } else if (section.type === "metrics" && Array.isArray(section.data)) {
      section.data.forEach((item: { label: string; value: string }) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        doc.setTextColor(...COLORS.muted);
        doc.setFontSize(9);
        doc.text(`${item.label}:`, margin, yPos);
        doc.setTextColor(...COLORS.text);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, margin + 60, yPos);
        doc.setFont("helvetica", "normal");
        yPos += 6;
      });
      yPos += 5;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("SAFIRI SMART FLEET - Confidential Report", margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  // Save the PDF
  const fileName = `safiri-fleet-${data.title.toLowerCase().replace(/\s+/g, "-")}-${now.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
