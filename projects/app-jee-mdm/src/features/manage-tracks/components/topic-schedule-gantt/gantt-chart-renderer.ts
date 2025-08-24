import { Track } from '../../entities/track';
import { TopicSchedule } from '../../entities/topic-schedule';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs with the week plugins
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export interface GanttChartConfig {
  // Layout configuration
  rowHeight: number;
  headerHeight: number;
  labelWidth: number;
  dayWidth: number;

  // Font configuration
  headerFont: string;
  trackHeaderFont: string;
  topicFont: string;
  blockFont: string;

  // Color configuration
  headerBackgroundColor: string;
  trackHeaderBackgroundColor: string;
  gridLineColor: string;
  monthGridLineColor: string;
  weekGridLineColor: string;
  headerSeparatorColor: string;
  rowSeparatorColor: string;
  blockBorderColor: string;
  blockTextColor: string;

  // Phase colors
  phaseColors: {
    coaching: string;
    selfStudy: string;
    exercise: string;
    consolidation: string;
  };
}

interface GanttCanvases {
  cornerCanvas: HTMLCanvasElement;
  headerCanvas: HTMLCanvasElement;
  labelsCanvas: HTMLCanvasElement;
  contentCanvas: HTMLCanvasElement;
}

export class GanttChartRenderer {
  private canvases: GanttCanvases;
  private cornerCtx: CanvasRenderingContext2D;
  private headerCtx: CanvasRenderingContext2D;
  private labelsCtx: CanvasRenderingContext2D;
  private contentCtx: CanvasRenderingContext2D;
  private config: GanttChartConfig;

  constructor(canvases: GanttCanvases, config?: Partial<GanttChartConfig>) {
    this.canvases = canvases;
    this.cornerCtx = this.canvases.cornerCanvas.getContext('2d')!;
    this.headerCtx = this.canvases.headerCanvas.getContext('2d')!;
    this.labelsCtx = this.canvases.labelsCanvas.getContext('2d')!;
    this.contentCtx = this.canvases.contentCanvas.getContext('2d')!;

    // Default configuration
    this.config = {
      rowHeight: 20,
      headerHeight: 40,
      labelWidth: 250,
      dayWidth: 10,

      headerFont: '12px Arial',
      trackHeaderFont: 'bold 14px Arial',
      topicFont: '12px Arial',
      blockFont: '10px Arial',

      headerBackgroundColor: '#e0e0e0',
      trackHeaderBackgroundColor: '#f0f0f0',
      gridLineColor: '#ddd',
      monthGridLineColor: '#aaa',
      weekGridLineColor: '#bbb',
      headerSeparatorColor: '#999',
      rowSeparatorColor: '#eee',
      blockBorderColor: '#333',
      blockTextColor: '#fff',

      phaseColors: {
        coaching: '#4CAF50',     // Green
        selfStudy: '#2196F3',    // Blue
        exercise: '#FFC107',     // Yellow
        consolidation: '#FF5722' // Orange
      }
    };

    // Override defaults with provided config
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public resizeCanvases(): void {
    // Get container dimensions
    const cornerContainer = this.canvases.cornerCanvas.parentElement!;
    const headerContainer = this.canvases.headerCanvas.parentElement!;
    const labelsContainer = this.canvases.labelsCanvas.parentElement!;
    const contentContainer = this.canvases.contentCanvas.parentElement!;

    // Resize corner canvas
    this.canvases.cornerCanvas.width = this.config.labelWidth;
    this.canvases.cornerCanvas.height = this.config.headerHeight;

    // Resize header canvas (full width, header height)
    this.canvases.headerCanvas.width = contentContainer.scrollWidth || contentContainer.clientWidth;
    this.canvases.headerCanvas.height = this.config.headerHeight;

    // Resize labels canvas (label width, full height)
    this.canvases.labelsCanvas.width = this.config.labelWidth;
    this.canvases.labelsCanvas.height = contentContainer.scrollHeight || contentContainer.clientHeight;

    // Resize content canvas - use scrollWidth to ensure it's wide enough for scrolling
    // Note: We'll adjust this width further in renderGanttChart if needed
    this.canvases.contentCanvas.width = contentContainer.scrollWidth || contentContainer.clientWidth;
    this.canvases.contentCanvas.height = contentContainer.scrollHeight || contentContainer.clientHeight;
  }

  public renderGanttChart(tracks: Track[]): void {
    if (!tracks || tracks.length === 0) return;

    // Clear all canvases
    this.cornerCtx.clearRect(0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height);
    this.headerCtx.clearRect(0, 0, this.canvases.headerCanvas.width, this.canvases.headerCanvas.height);
    this.labelsCtx.clearRect(0, 0, this.canvases.labelsCanvas.width, this.canvases.labelsCanvas.height);
    this.contentCtx.clearRect(0, 0, this.canvases.contentCanvas.width, this.canvases.contentCanvas.height);

    // Calculate total height needed for the chart
    let totalRows = 0;

    // Count total rows (track headers + topic schedules)
    tracks.forEach(track => {
      totalRows += 1; // Track header
      totalRows += track.getNumTopicsScheduled(); // Topic schedules in this track
    });

    const totalHeight = (totalRows * this.config.rowHeight);

    // Find earliest start date and latest end date across all schedules
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    tracks.forEach(track => {
      for (const schedule of track) {
        if (!earliestDate || schedule.startDate < earliestDate) {
          earliestDate = schedule.startDate;
        }
        if (!latestDate || schedule.endDate > latestDate) {
          latestDate = schedule.endDate;
        }
      }
    });

    if (!earliestDate || !latestDate) return;

    // Calculate total days in the chart
    const totalDays = dayjs(latestDate).diff(earliestDate, 'day') + 1;

    // Calculate required content width
    const requiredWidth = totalDays * this.config.dayWidth;

    // Resize canvases if needed
    if (totalHeight > this.canvases.labelsCanvas.height) {
      this.canvases.labelsCanvas.height = totalHeight;
      this.canvases.contentCanvas.height = totalHeight;
    }

    if (requiredWidth > this.canvases.headerCanvas.width) {
      this.canvases.headerCanvas.width = requiredWidth;
      this.canvases.contentCanvas.width = requiredWidth;
    }

    // Render corner (empty or with a title)
    this.renderCorner();

    // Render header with months and weeks
    const { monthBoundaries, weekBoundaries } = this.renderHeader(earliestDate, totalDays);

    // Render labels and content
    let currentY = 0;

    tracks.forEach(track => {
      // Render track header in labels canvas
      this.renderTrackHeader(track, currentY);

      // Render track content (grid lines) in content canvas
      this.renderTrackContent(track, currentY, earliestDate!, totalDays, monthBoundaries, weekBoundaries);

      currentY += this.config.rowHeight;

      // Render topic schedules for this track
      for (const schedule of track) {
        // Render topic name in labels canvas
        this.renderTopicLabel(schedule, currentY);

        // Render topic blocks in content canvas
        this.renderTopicBlocks(schedule, earliestDate!, currentY);

        currentY += this.config.rowHeight;
      }
    });
  }

  private renderCorner(): void {
    // Render corner background
    this.cornerCtx.fillStyle = this.config.headerBackgroundColor;
    this.cornerCtx.fillRect(0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height);

    // Optionally render a title or icon in the corner
    this.cornerCtx.fillStyle = '#333';
    this.cornerCtx.font = this.config.headerFont;
    this.cornerCtx.textAlign = 'center';
    this.cornerCtx.fillText('Topics', this.canvases.cornerCanvas.width / 2, this.canvases.cornerCanvas.height / 2 + 5);

    // Render border
    this.cornerCtx.strokeStyle = this.config.headerSeparatorColor;
    this.cornerCtx.strokeRect(0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height);
  }

  private renderHeader(startDate: Date, totalDays: number): { monthBoundaries: number[], weekBoundaries: number[] } {
    // Render header background
    this.headerCtx.fillStyle = this.config.headerBackgroundColor;
    this.headerCtx.fillRect(0, 0, this.canvases.headerCanvas.width, this.config.headerHeight);

    // Calculate the month and week boundaries
    const months: { [key: string]: { start: number, end: number, label: string } } = {};
    const weeks: { [key: string]: { start: number, end: number, label: string } } = {};

    for (let i = 0; i <= totalDays; i++) {
      const date = dayjs(startDate).add(i, 'day');
      const monthKey = date.format('YYYY-MM');
      const weekKey = `${date.year()}-${date.isoWeek()}`;

      // Track months
      if (!months[monthKey]) {
        months[monthKey] = {
          start: i,
          end: i,
          label: date.format('MMM-YY')
        };
      } else {
        months[monthKey].end = i;
      }

      // Track weeks
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          start: i,
          end: i,
          label: `W${date.isoWeek()}`
        };
      } else {
        weeks[weekKey].end = i;
      }
    }

    // Render month headers
    this.headerCtx.fillStyle = '#333';
    this.headerCtx.font = this.config.headerFont;
    this.headerCtx.textAlign = 'center';

    const monthHeight = this.config.headerHeight / 2;

    Object.values(months).forEach(month => {
      const startX = month.start * this.config.dayWidth;
      const endX = month.end * this.config.dayWidth;
      const width = endX - startX + this.config.dayWidth;

      // Draw month background
      this.headerCtx.fillStyle = this.config.headerBackgroundColor;
      this.headerCtx.fillRect(startX, 0, width, monthHeight);

      // Draw month border
      this.headerCtx.strokeStyle = this.config.gridLineColor;
      this.headerCtx.strokeRect(startX, 0, width, monthHeight);

      // Draw month label
      this.headerCtx.fillStyle = '#333';
      this.headerCtx.fillText(month.label, startX + (width / 2), monthHeight / 2 + 5);
    });

    // Render week headers
    Object.values(weeks).forEach(week => {
      const startX = week.start * this.config.dayWidth;
      const endX = week.end * this.config.dayWidth;
      const width = endX - startX + this.config.dayWidth;

      // Draw week background
      this.headerCtx.fillStyle = this.config.headerBackgroundColor;
      this.headerCtx.fillRect(startX, monthHeight, width, monthHeight);

      // Draw week border
      this.headerCtx.strokeStyle = this.config.gridLineColor;
      this.headerCtx.strokeRect(startX, monthHeight, width, monthHeight);

      // Draw week label
      this.headerCtx.fillStyle = '#333';
      this.headerCtx.fillText(week.label, startX + (width / 2), monthHeight + (monthHeight / 2) + 5);
    });

    // Collect month and week boundary indices
    const monthBoundaries: number[] = [];
    const weekBoundaries: number[] = [];

    Object.values(months).forEach(month => {
      monthBoundaries.push(month.start);
      if (month.end < totalDays) {
        monthBoundaries.push(month.end + 1);
      }
    });

    Object.values(weeks).forEach(week => {
      weekBoundaries.push(week.start);
      if (week.end < totalDays) {
        weekBoundaries.push(week.end + 1);
      }
    });

    // Render vertical grid lines in header
    for (let i = 0; i <= totalDays; i++) {
      const x = i * this.config.dayWidth;

      // Determine grid line color for header based on boundaries
      let headerGridColor = this.config.gridLineColor;
      let isMonthBoundary = monthBoundaries.includes(i);
      let isWeekBoundary = weekBoundaries.includes(i);

      if (isMonthBoundary) {
        headerGridColor = this.config.monthGridLineColor;
      } else if (isWeekBoundary) {
        headerGridColor = this.config.weekGridLineColor;
      }

      // Draw grid line in header area
      // For month row (top half), only draw month boundary lines
      if (isMonthBoundary) {
        this.headerCtx.beginPath();
        this.headerCtx.moveTo(x, 0);
        this.headerCtx.lineTo(x, monthHeight);
        this.headerCtx.strokeStyle = this.config.monthGridLineColor;
        this.headerCtx.stroke();
      }

      // For week row (bottom half), draw both month and week boundary lines
      this.headerCtx.beginPath();
      this.headerCtx.moveTo(x, monthHeight);
      this.headerCtx.lineTo(x, this.config.headerHeight);
      this.headerCtx.strokeStyle = headerGridColor;
      this.headerCtx.stroke();
    }

    // Render header separator line
    this.headerCtx.beginPath();
    this.headerCtx.moveTo(0, this.config.headerHeight - 1);
    this.headerCtx.lineTo(this.canvases.headerCanvas.width, this.config.headerHeight - 1);
    this.headerCtx.strokeStyle = this.config.headerSeparatorColor;
    this.headerCtx.stroke();

    // Return grid boundary information for content rendering
    return { monthBoundaries, weekBoundaries };
  }

  private renderTrackHeader(track: Track, y: number): void {
    // Render track header background
    this.labelsCtx.fillStyle = this.config.trackHeaderBackgroundColor;
    this.labelsCtx.fillRect(0, y, this.canvases.labelsCanvas.width, this.config.rowHeight);

    // Render track name
    this.labelsCtx.fillStyle = '#333';
    this.labelsCtx.font = this.config.trackHeaderFont;
    this.labelsCtx.textAlign = 'left';
    this.labelsCtx.fillText(track.trackName, 10, y + (this.config.rowHeight / 2) + 5);

    // Render separator line
    this.labelsCtx.beginPath();
    this.labelsCtx.moveTo(0, y + this.config.rowHeight);
    this.labelsCtx.lineTo(this.canvases.labelsCanvas.width, y + this.config.rowHeight);
    this.labelsCtx.strokeStyle = this.config.gridLineColor;
    this.labelsCtx.stroke();
  }

  private renderTrackContent(
    track: Track, 
    y: number, 
    chartStartDate: Date, 
    totalDays: number, 
    monthBoundaries: number[], 
    weekBoundaries: number[]
  ): void {
    // Render track row background in content canvas
    this.contentCtx.fillStyle = this.config.trackHeaderBackgroundColor;
    this.contentCtx.fillRect(0, y, this.canvases.contentCanvas.width, this.config.rowHeight);

    // Only render month and week boundary grid lines for track headers
    // to avoid unwanted grid lines
    this.renderVerticalGridLines(y, totalDays, monthBoundaries, weekBoundaries, true);

    // Render separator line
    this.contentCtx.beginPath();
    this.contentCtx.moveTo(0, y + this.config.rowHeight);
    this.contentCtx.lineTo(this.canvases.contentCanvas.width, y + this.config.rowHeight);
    this.contentCtx.strokeStyle = this.config.gridLineColor;
    this.contentCtx.stroke();
  }

  private renderVerticalGridLines(
    y: number, 
    totalDays: number, 
    monthBoundaries?: number[], 
    weekBoundaries?: number[],
    isTrackHeader: boolean = false
  ): void {
    // If we don't have boundaries, calculate them based on the current date
    if (!monthBoundaries || !weekBoundaries) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start from the first day of current month

      // Calculate month and week boundaries
      const months: { [key: string]: { start: number, end: number } } = {};
      const weeks: { [key: string]: { start: number, end: number } } = {};

      for (let i = 0; i <= totalDays; i++) {
        const date = dayjs(startDate).add(i, 'day');
        const monthKey = date.format('YYYY-MM');
        const weekKey = `${date.year()}-${date.isoWeek()}`;

        // Track months
        if (!months[monthKey]) {
          months[monthKey] = { start: i, end: i };
        } else {
          months[monthKey].end = i;
        }

        // Track weeks
        if (!weeks[weekKey]) {
          weeks[weekKey] = { start: i, end: i };
        } else {
          weeks[weekKey].end = i;
        }
      }

      // Convert to arrays of boundary indices
      monthBoundaries = [];
      weekBoundaries = [];

      Object.values(months).forEach(month => {
        monthBoundaries!.push(month.start);
        if (month.end < totalDays) {
          monthBoundaries!.push(month.end + 1);
        }
      });

      Object.values(weeks).forEach(week => {
        weekBoundaries!.push(week.start);
        if (week.end < totalDays) {
          weekBoundaries!.push(week.end + 1);
        }
      });
    }

    // For track headers, only render month and week boundaries
    if (isTrackHeader) {
      // Render month boundaries
      monthBoundaries.forEach(i => {
        const x = i * this.config.dayWidth;
        this.contentCtx.beginPath();
        this.contentCtx.moveTo(x, y);
        this.contentCtx.lineTo(x, y + this.config.rowHeight);
        this.contentCtx.strokeStyle = this.config.monthGridLineColor;
        this.contentCtx.stroke();
      });

      // Render week boundaries (skip if also a month boundary)
      weekBoundaries.forEach(i => {
        if (!monthBoundaries.includes(i)) {
          const x = i * this.config.dayWidth;
          this.contentCtx.beginPath();
          this.contentCtx.moveTo(x, y);
          this.contentCtx.lineTo(x, y + this.config.rowHeight);
          this.contentCtx.strokeStyle = this.config.weekGridLineColor;
          this.contentCtx.stroke();
        }
      });
    } else {
      // For topic rows, render all grid lines
      for (let i = 0; i <= totalDays; i++) {
        const x = i * this.config.dayWidth;

        // Determine grid line color based on boundaries
        let gridColor = this.config.gridLineColor; // Default to day grid line color
        const isMonthBoundary = monthBoundaries.includes(i);
        const isWeekBoundary = weekBoundaries.includes(i);

        if (isMonthBoundary) {
          gridColor = this.config.monthGridLineColor;
        } else if (isWeekBoundary) {
          gridColor = this.config.weekGridLineColor;
        }

        // Draw grid line
        this.contentCtx.beginPath();
        this.contentCtx.moveTo(x, y);
        this.contentCtx.lineTo(x, y + this.config.rowHeight);
        this.contentCtx.strokeStyle = gridColor;
        this.contentCtx.stroke();
      }
    }
  }

  private renderTopicLabel(schedule: TopicSchedule, y: number): void {
    // Render topic name in labels canvas
    this.labelsCtx.fillStyle = '#333';
    this.labelsCtx.font = this.config.topicFont;
    this.labelsCtx.textAlign = 'left';
    this.labelsCtx.fillText(schedule.topic.topicName, 20, y + (this.config.rowHeight / 2) + 4);

    // Render row separator line
    this.labelsCtx.beginPath();
    this.labelsCtx.moveTo(0, y + this.config.rowHeight);
    this.labelsCtx.lineTo(this.canvases.labelsCanvas.width, y + this.config.rowHeight);
    this.labelsCtx.strokeStyle = this.config.rowSeparatorColor;
    this.labelsCtx.stroke();
  }

  private renderTopicBlocks(schedule: TopicSchedule, chartStartDate: Date, y: number): void {
    // Calculate position on the chart
    const startDays = dayjs(schedule.startDate).diff(chartStartDate, 'day');
    const totalDays = schedule.numDays;

    const startX = startDays * this.config.dayWidth;
    const width = totalDays * this.config.dayWidth;

    // Get the total days in the chart from the canvas width
    const totalDaysInChart = Math.ceil(this.canvases.contentCanvas.width / this.config.dayWidth);

    // Calculate month and week boundaries based on the chart start date
    const months: { [key: string]: { start: number, end: number } } = {};
    const weeks: { [key: string]: { start: number, end: number } } = {};

    for (let i = 0; i <= totalDaysInChart; i++) {
      const date = dayjs(chartStartDate).add(i, 'day');
      const monthKey = date.format('YYYY-MM');
      const weekKey = `${date.year()}-${date.isoWeek()}`;

      // Track months
      if (!months[monthKey]) {
        months[monthKey] = { start: i, end: i };
      } else {
        months[monthKey].end = i;
      }

      // Track weeks
      if (!weeks[weekKey]) {
        weeks[weekKey] = { start: i, end: i };
      } else {
        weeks[weekKey].end = i;
      }
    }

    // Convert to arrays of boundary indices
    const monthBoundaries: number[] = [];
    const weekBoundaries: number[] = [];

    Object.values(months).forEach(month => {
      monthBoundaries.push(month.start);
      if (month.end < totalDaysInChart) {
        monthBoundaries.push(month.end + 1);
      }
    });

    Object.values(weeks).forEach(week => {
      weekBoundaries.push(week.start);
      if (week.end < totalDaysInChart) {
        weekBoundaries.push(week.end + 1);
      }
    });

    // Render vertical grid lines for month and week boundaries
    // This is needed to fix the missing vertical grid lines issue
    this.renderVerticalGridLines(y, totalDaysInChart, monthBoundaries, weekBoundaries, false);

    // Calculate widths for each phase
    const coachingWidth = (schedule.coachingNumDays / totalDays) * width;
    const selfStudyWidth = (schedule.selfStudyNumDays / totalDays) * width;
    const exerciseWidth = (schedule.exerciseNumDays / totalDays) * width;
    const consolidationWidth = (schedule.consolidationNumDays / totalDays) * width;

    // Render the four distinct blocks in content canvas
    let currentX = startX;

    // Coaching block
    this.renderBlock(currentX, y, coachingWidth, this.config.phaseColors.coaching);
    currentX += coachingWidth;

    // Self Study block
    this.renderBlock(currentX, y, selfStudyWidth, this.config.phaseColors.selfStudy);
    currentX += selfStudyWidth;

    // Exercise block
    this.renderBlock(currentX, y, exerciseWidth, this.config.phaseColors.exercise);
    currentX += exerciseWidth;

    // Consolidation block
    this.renderBlock(currentX, y, consolidationWidth, this.config.phaseColors.consolidation);

    // Render row separator line
    this.contentCtx.beginPath();
    this.contentCtx.moveTo(0, y + this.config.rowHeight);
    this.contentCtx.lineTo(this.canvases.contentCanvas.width, y + this.config.rowHeight);
    this.contentCtx.strokeStyle = this.config.rowSeparatorColor;
    this.contentCtx.stroke();
  }

  private renderBlock(x: number, y: number, width: number, color: string): void {
    const height = this.config.rowHeight - 6;
    const blockY = y + 3;

    // Render block background
    this.contentCtx.fillStyle = color;
    this.contentCtx.fillRect(x, blockY, width, height);

    // Render block border
    this.contentCtx.strokeStyle = this.config.blockBorderColor;
    this.contentCtx.lineWidth = 1;
    this.contentCtx.strokeRect(x, blockY, width, height);
  }
}
