import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { FirstTimer, Followup, Caller, CellStat, InviterStat } from '@/lib/types';

export interface ReportData {
  period: string;
  branchName: string;
  generatedAt: Date;
  logoDataUrl?: string;
  stats: {
    totalFirstTimers: number;
    assignedFirstTimers: number;
    unassignedFirstTimers: number;
    fullyJoinedCount: number;
    joiningCount: number;
    visitingCount: number;
    followedUpThisWeekCount: number;
    pendingFollowupThisWeekCount: number;
    totalFollowups: number;
    followupsContacted: number;
    completionRate: number;
  };
  topCells: CellStat[];
  topInviters: InviterStat[];
  callerPerformance: Array<{
    name: string;
    assigned: number;
    followedUpThisWeek: number;
    pendingThisWeek: number;
    fullyJoined: number;
  }>;
  firstTimers: FirstTimer[];
  followups: Followup[];
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = this.margin;
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private addHeader(reportData: ReportData): void {
    // Branded header background
    this.doc.setFillColor(18, 29, 85); // #121D55
    this.doc.rect(0, 0, this.pageWidth, 44, 'F');

    // Logo container
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.margin, 10, 48, 24, 2, 2, 'F');

    // App logo
    if (reportData.logoDataUrl) {
      try {
        this.doc.addImage(reportData.logoDataUrl, 'PNG', this.margin + 2, 12, 44, 20);
      } catch {
        // Logo rendering should not block report generation.
      }
    }

    // App and report title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('First Timer Platform', 76, 20);

    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Telepastoring Department Report', 76, 29);

    this.doc.setFontSize(10);
    this.doc.text(`Period: ${reportData.period}`, 76, 36);

    // Meta block
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    this.currentY = 56;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Branch: ${reportData.branchName}`, this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated: ${reportData.generatedAt.toLocaleString()}`, this.margin, this.currentY);
    this.currentY += 12;

    this.doc.setDrawColor(220, 225, 235);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addSection(title: string): void {
    this.checkPageBreak(15);
    
    this.doc.setFillColor(18, 29, 85);
    this.doc.rect(this.margin, this.currentY, 170, 10, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, this.currentY + 7);
    
    this.currentY += 15;
  }

  private addStatsGrid(reportData: ReportData): void {
    this.checkPageBreak(60);
    
    const stats = [
      { label: 'Total First Timers', value: reportData.stats.totalFirstTimers },
      { label: 'Assigned', value: reportData.stats.assignedFirstTimers },
      { label: 'Unassigned', value: reportData.stats.unassignedFirstTimers },
      { label: 'Fully Joined', value: reportData.stats.fullyJoinedCount },
      { label: 'Joining', value: reportData.stats.joiningCount },
      { label: 'Visiting', value: reportData.stats.visitingCount },
      { label: 'Followed Up This Week', value: reportData.stats.followedUpThisWeekCount },
      { label: 'Pending Follow-up', value: reportData.stats.pendingFollowupThisWeekCount },
      { label: 'Completion Rate', value: `${reportData.stats.completionRate}%` },
    ];

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    
    let x = this.margin;
    let y = this.currentY;
    const boxWidth = 50;
    const boxHeight = 25;
    const spacing = 5;

    stats.forEach((stat, index) => {
      if (index % 3 === 0 && index > 0) {
        x = this.margin;
        y += boxHeight + spacing;
      }

      // Draw box
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(x, y, boxWidth, boxHeight);
      
      // Add text
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.value.toString(), x + boxWidth / 2, y + 12, { align: 'center' });
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(stat.label, x + boxWidth / 2, y + 20, { align: 'center' });
      
      x += boxWidth + spacing;
    });

    this.currentY = y + boxHeight + 15;
  }

  private addTable(headers: string[], data: string[][]): void {
    const tableWidth = this.pageWidth - this.margin * 2;
    const columnWidth = tableWidth / headers.length;
    const rowHeight = 8;
    
    // Header row
    this.checkPageBreak(20);
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * columnWidth) + 2, this.currentY + 5);
    });
    
    this.currentY += rowHeight;
    
    // Data rows
    this.doc.setFont('helvetica', 'normal');
    data.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight + 2);
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
      }
      
      row.forEach((cell, cellIndex) => {
        const maxChars = Math.max(Math.floor((columnWidth - 4) / 1.7), 6);
        const safeCell = cell.length > maxChars ? `${cell.slice(0, maxChars - 1)}...` : cell;
        this.doc.text(safeCell, this.margin + (cellIndex * columnWidth) + 2, this.currentY + 5);
      });
      
      this.currentY += rowHeight;
    });
    
    this.currentY += 10;
  }

  private addTopCells(reportData: ReportData): void {
    this.addSection('Top Performing Cells');
    
    if (reportData.topCells.length === 0) {
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(10);
      this.doc.text('No cell data available for this period.', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    const headers = ['Cell', 'Count', 'Share'];
    const data = reportData.topCells.map(cell => [
      cell.cell,
      cell.count.toString(),
      `${Math.round((cell.count / cell.total) * 100)}%`
    ]);
    
    this.addTable(headers, data);
  }

  private addInviterAnalytics(reportData: ReportData): void {
    this.addSection('Inviter Analytics');
    
    if (reportData.topInviters.length === 0) {
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(10);
      this.doc.text('No inviter data available for this period.', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    const headers = ['Inviter', 'Total', 'Joined', 'Deciding', 'Conversion'];
    const data = reportData.topInviters.map(inviter => [
      inviter.inviter,
      inviter.invitedCount.toString(),
      inviter.fullyJoinedCount.toString(),
      inviter.stillDecidingCount.toString(),
      `${inviter.conversionRate}%`
    ]);
    
    this.addTable(headers, data);
  }

  private addCallerPerformance(reportData: ReportData): void {
    this.addSection('Caller Performance');
    
    if (reportData.callerPerformance.length === 0) {
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(10);
      this.doc.text('No caller performance data available for this period.', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    const headers = ['Caller', 'Assigned', 'Followed Up', 'Pending', 'Joined'];
    const data = reportData.callerPerformance.map(caller => [
      caller.name,
      caller.assigned.toString(),
      caller.followedUpThisWeek.toString(),
      caller.pendingThisWeek.toString(),
      caller.fullyJoined.toString()
    ]);
    
    this.addTable(headers, data);
  }

  private addSummary(reportData: ReportData): void {
    this.addSection('Executive Summary');
    
    this.checkPageBreak(40);
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const summary = [
      `During ${reportData.period}, the Telepastoring Department processed ${reportData.stats.totalFirstTimers} first timers.`,
      `${reportData.stats.fullyJoinedCount} first timers fully joined the church (${reportData.stats.totalFirstTimers > 0 ? Math.round((reportData.stats.fullyJoinedCount / reportData.stats.totalFirstTimers) * 100) : 0}% conversion rate).`,
      `${reportData.stats.followedUpThisWeekCount} follow-up calls were completed in this period with a ${reportData.stats.completionRate}% completion rate.`,
      `${reportData.stats.unassignedFirstTimers} first timers are still waiting for caller assignment.`,
    ];
    
    summary.forEach((line, index) => {
      this.doc.text(`${index + 1}. ${line}`, this.margin, this.currentY);
      this.currentY += 8;
    });
    
    this.currentY += 10;
    
    // Challenges and Recommendations
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Observations:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    
    const observations = [];
    
    if (reportData.stats.unassignedFirstTimers > 0) {
      observations.push(`${reportData.stats.unassignedFirstTimers} first timers need immediate caller assignment`);
    }
    
    if (reportData.stats.completionRate < 80) {
      observations.push('Follow-up completion rate needs improvement - consider caller workload redistribution');
    }
    
    if (reportData.stats.fullyJoinedCount / reportData.stats.totalFirstTimers > 0.5) {
      observations.push('Excellent conversion rate - current strategies are working well');
    }
    
    if (observations.length === 0) {
      observations.push('All metrics are within acceptable ranges');
    }
    
    observations.forEach((observation, index) => {
      this.doc.text(`• ${observation}`, this.margin + 5, this.currentY);
      this.currentY += 8;
    });
  }

  private addFooter(): void {
    const totalPages = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 15, 210 - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Telepastoring Department - Page ${i} of ${totalPages}`,
        this.margin,
        this.pageHeight - 10
      );
      
      this.doc.text(
        'Vision: Nobody should be left out',
        210 - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  public generateReport(reportData: ReportData): Blob {
    // Reset document
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = this.margin;

    // Build report
    this.addHeader(reportData);
    this.addStatsGrid(reportData);
    this.addTopCells(reportData);
    this.addInviterAnalytics(reportData);
    this.addCallerPerformance(reportData);
    this.addSummary(reportData);
    this.addFooter();

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  public downloadReport(reportData: ReportData): void {
    const pdfBlob = this.generateReport(reportData);
    const fileName = `telepastoring-report-${reportData.period.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    saveAs(pdfBlob, fileName);
  }
}

export const generateMonthlyReport = (reportData: ReportData): void => {
  const generator = new PDFReportGenerator();
  generator.downloadReport(reportData);
};

export const generateReportBlob = (reportData: ReportData): Blob => {
  const generator = new PDFReportGenerator();
  return generator.generateReport(reportData);
};
