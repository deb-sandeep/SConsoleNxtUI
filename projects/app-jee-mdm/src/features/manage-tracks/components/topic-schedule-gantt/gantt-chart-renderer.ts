import { Track } from '../../entities/track' ;
import { TopicSchedule } from '../../entities/topic-schedule' ;
import dayjs from 'dayjs' ;
import weekOfYear from 'dayjs/plugin/weekOfYear' ;
import isoWeek from 'dayjs/plugin/isoWeek' ;

// Extend dayjs with the week plugins
dayjs.extend( weekOfYear );
dayjs.extend( isoWeek );

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
    selectedTopicBackgroundColor: string;
    trackBgColors?: string[];  // Array of background colors for tracks
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
        interTopicGap: string;
    };
}

interface GanttCanvases {
    cornerCanvas: HTMLCanvasElement;
    headerCanvas: HTMLCanvasElement;
    labelsCanvas: HTMLCanvasElement;
    contentCanvas: HTMLCanvasElement;
}

/**
 * GanttChartRenderer is responsible for rendering a Gantt chart visualization of topic schedules within tracks.
 * 
 * The class uses HTML5 Canvas to draw a multi-layered Gantt chart with the following components:
 * - Corner canvas: Displays the title in the top-left corner
 * - Header canvas: Shows month and week headers with appropriate grid lines
 * - Labels canvas: Displays topic names on the left side
 * - Content canvas: Renders the actual Gantt chart blocks representing different phases of topics
 * 
 * The rendering process follows this flow:
 * 1. Initialize canvases and configuration
 * 2. Resize canvases based on content
 * 3. Calculate chart dimensions based on date ranges
 * 4. Render chart components (corner, header, topic schedules)
 * 5. For each topic schedule, render labels and blocks with appropriate styling
 * 
 * The chart visually distinguishes different phases of topic schedules (coaching, self-study, 
 * exercise, consolidation) using different colors, and supports visual customization through
 * the GanttChartConfig interface.
 */
export class GanttChartRenderer {
    private canvases: GanttCanvases;
    private cornerCtx: CanvasRenderingContext2D;
    private headerCtx: CanvasRenderingContext2D;
    private labelsCtx: CanvasRenderingContext2D;
    private contentCtx: CanvasRenderingContext2D;

    private readonly config: GanttChartConfig;

    private tracks: Track[];

    /**
     * Creates a new GanttChartRenderer instance.
     * 
     * @param canvases - Object containing the four canvas elements used for rendering different parts of the Gantt chart:
     *                   cornerCanvas (top-left), headerCanvas (top), labelsCanvas (left), and contentCanvas (main chart area)
     * @param config - Optional configuration object to customize the appearance and behavior of the Gantt chart.
     *                 If provided, these settings will override the default configuration.
     */
    constructor( canvases: GanttCanvases, config?: Partial<GanttChartConfig> ) {
        this.canvases = canvases;
        this.cornerCtx = this.canvases.cornerCanvas.getContext( '2d' )!;
        this.headerCtx = this.canvases.headerCanvas.getContext( '2d' )!;
        this.labelsCtx = this.canvases.labelsCanvas.getContext( '2d' )!;
        this.contentCtx = this.canvases.contentCanvas.getContext( '2d' )!;

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
            selectedTopicBackgroundColor: '#e5fa94',
            trackBgColors: [
                '#f0f0f0',  // Default color (same as trackHeaderBackgroundColor)
                '#e6f7ff',  // Light blue
                '#f9f0ff',  // Light purple
                '#fff7e6',  // Light orange
                '#e6ffe6',  // Light green
                '#ffe6e6'   // Light red
            ],
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
                consolidation: '#FF5722', // Orange
                interTopicGap: '#FFFFFF',
            }
        };

        // Override defaults with the provided config
        if( config ) {
            this.config = { ...this.config, ...config };
        }
    }

    /**
     * Resizes all canvases based on the parent container dimensions.
     * 
     * This method adjusts the dimensions of all four canvases (corner, header, labels, content)
     * to match the current size of the parent container. It ensures that the canvases are properly
     * sized for rendering the Gantt chart. After resizing, it triggers a re-render of the chart
     * if tracks data is available.
     * 
     * Note: If the container has zero height, all canvases will be set to zero height and no
     * rendering will occur.
     */
    public resizeCanvases(): void {
        // Get container dimensions
        const contentContainer = this.canvases.contentCanvas.parentElement!;
        if( contentContainer.clientHeight === 0 ) {
            this.canvases.cornerCanvas.height = 0;
            this.canvases.headerCanvas.height = 0;
            this.canvases.labelsCanvas.height = 0;
            this.canvases.contentCanvas.height = 0;
            return ;
        }

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

        this.renderGanttChart( this.tracks ) ;
    }

    /**
     * Renders the Gantt chart based on the provided tracks data.
     * 
     * This is the main rendering method that orchestrates the entire chart rendering process.
     * It performs the following steps:
     * 1. Validates input data and canvas dimensions
     * 2. Clears all canvases
     * 3. Determines date boundaries across all schedules
     * 4. Collects and sorts all topic schedules
     * 5. Calculates chart dimensions and resizes canvases if needed
     * 6. Renders all chart components (corner, header, topic schedules)
     * 
     * @param tracks - Array of Track objects containing topic schedules to be rendered in the Gantt chart.
     *                 Each track contains multiple topic schedules that will be displayed as rows in the chart.
     */
    public renderGanttChart( tracks: Track[] ): void {
        // Early validation
        if( this.canvases.cornerCanvas.height === 0 ) return;
        if( !tracks || tracks.length === 0 ) return;

        this.tracks = tracks;

        // Clear all canvases
        this.clearAllCanvases();

        // Find the earliest start date and latest end date across all schedules
        const { earliestDate, latestDate } = this.getChartDateBoundaries( tracks );
        if( !earliestDate || !latestDate ) return;

        // Collect and sort all topic schedules
        const allSchedules = this.collectAndSortSchedules(tracks);

        // Calculate chart dimensions and resize canvases if needed
        const totalDays = this.calculateChartDimensions(allSchedules, earliestDate, latestDate);

        // Render chart components
        this.renderChartComponents(allSchedules, earliestDate, totalDays);
    }

    /**
     * Clears all canvas elements to prepare for a new render.
     * 
     * This method resets all four canvases (corner, header, labels, content) by clearing
     * their entire drawing area. This is typically called at the beginning of the rendering
     * process to ensure a clean slate before drawing the new chart.
     */
    private clearAllCanvases(): void {
        this.cornerCtx.clearRect( 0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height );
        this.headerCtx.clearRect( 0, 0, this.canvases.headerCanvas.width, this.canvases.headerCanvas.height );
        this.labelsCtx.clearRect( 0, 0, this.canvases.labelsCanvas.width, this.canvases.labelsCanvas.height );
        this.contentCtx.clearRect( 0, 0, this.canvases.contentCanvas.width, this.canvases.contentCanvas.height );
    }

    /**
     * Collects all topic schedules from all tracks and sorts them by start date.
     * 
     * This method flattens the nested structure of tracks and their contained topic schedules
     * into a single sorted array. The schedules are sorted chronologically by their start date,
     * which ensures that they will be rendered in the correct order in the Gantt chart.
     * 
     * @param tracks - Array of Track objects containing topic schedules
     * @returns A flat array of all TopicSchedule objects sorted by start date
     */
    private collectAndSortSchedules(tracks: Track[]): TopicSchedule[] {
        // Collect all topic schedules from all tracks
        const allSchedules: TopicSchedule[] = [];
        tracks.forEach(track => {
            for (const schedule of track) {
                allSchedules.push(schedule);
            }
        });

        // Sort schedules by coaching start date (which is the same as startDate)
        allSchedules.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        return allSchedules;
    }

    /**
     * Calculates the dimensions of the chart based on the schedules and date range.
     * 
     * This method determines the total height needed based on the number of topic schedules,
     * and the total width needed based on the date range (from earliest to latest date).
     * It then resizes the canvases if necessary to accommodate the calculated dimensions.
     * 
     * @param allSchedules - Array of all topic schedules to be rendered
     * @param earliestDate - The earliest start date across all schedules
     * @param latestDate - The latest end date across all schedules
     * @returns The total number of days in the chart (used for rendering grid lines and headers)
     */
    private calculateChartDimensions(allSchedules: TopicSchedule[], earliestDate: Date, latestDate: Date): number {
        // Calculate the parameters required to render the chart
        const totalRows = allSchedules.length; // Only count topic schedules, not track headers
        const totalHeight = ( totalRows * this.config.rowHeight );
        const totalDays = dayjs( latestDate ).diff( earliestDate, 'day' ) + 1;
        const requiredWidth = totalDays * this.config.dayWidth;

        // Resize canvases if needed
        this.resizeCanvasesIfNeeded(totalHeight, requiredWidth);

        return totalDays;
    }

    /**
     * Resizes canvases if the calculated dimensions exceed the current canvas size.
     * 
     * This method ensures that the canvases are large enough to accommodate all the content
     * that needs to be rendered. It only increases canvas dimensions if needed, never decreases them.
     * 
     * @param totalHeight - The calculated total height needed for the chart
     * @param requiredWidth - The calculated total width needed for the chart
     */
    private resizeCanvasesIfNeeded(totalHeight: number, requiredWidth: number): void {
        if( totalHeight > this.canvases.labelsCanvas.height ) {
            this.canvases.labelsCanvas.height = totalHeight;
            this.canvases.contentCanvas.height = totalHeight;
        }

        if( requiredWidth > this.canvases.headerCanvas.width ) {
            this.canvases.headerCanvas.width = requiredWidth;
            this.canvases.contentCanvas.width = requiredWidth;
        }
    }

    /**
     * Orchestrates the rendering of all chart components.
     * 
     * This method coordinates the rendering of the three main components of the Gantt chart:
     * 1. The corner area (top-left) with the title
     * 2. The header area (top) with month and week labels
     * 3. The topic schedules (main content area) with phase blocks
     * 
     * @param allSchedules - Array of all topic schedules to be rendered
     * @param earliestDate - The earliest start date across all schedules (used as chart start date)
     * @param totalDays - The total number of days in the chart
     */
    private renderChartComponents(allSchedules: TopicSchedule[], earliestDate: Date, totalDays: number): void {
        // Render corner (empty or with a title)
        this.renderCorner();

        // Render header with months and weeks
        this.renderHeader( earliestDate, totalDays );

        // Render topic schedules
        this.renderTopicSchedules(allSchedules, earliestDate);
    }

    /**
     * Renders all topic schedules in the chart.
     * 
     * This method iterates through all topic schedules and renders each one as a row in the chart.
     * For each schedule, it renders:
     * 1. The topic label in the labels canvas (left side)
     * 2. The topic blocks in the content canvas (main area)
     * 
     * Each topic is positioned vertically based on its order in the sorted schedules array.
     * 
     * @param allSchedules - Array of all topic schedules to be rendered
     * @param earliestDate - The earliest start date across all schedules (used as chart start date)
     */
    private renderTopicSchedules(allSchedules: TopicSchedule[], earliestDate: Date): void {
        let currentY = 0;

        // Render all topic schedules in sorted order
        allSchedules.forEach((schedule) => {
            const trackIndex = this.tracks.indexOf(schedule.track!);

            // Render topic name in labels canvas
            this.renderTopicLabel( schedule, currentY, trackIndex );

            // Render topic blocks in content canvas
            this.renderTopicBlocks( schedule, earliestDate, currentY, trackIndex );

            currentY += this.config.rowHeight;
        });
    }

    /**
     * Finds the earliest start date and latest end date across all schedules.
     * 
     * This method examines all topic schedules in all tracks to determine the overall
     * date range that the Gantt chart needs to cover. This is essential for calculating
     * the chart width and positioning elements correctly on the time axis.
     * 
     * @param tracks - Array of Track objects containing topic schedules
     * @returns An object containing the earliest and latest dates, or null if no schedules exist
     */
    private getChartDateBoundaries( tracks: Track[] ): { earliestDate: Date | null, latestDate: Date | null } {

        // Find the earliest start date and latest end date across all schedules
        let earliestDate: Date | null = null;
        let latestDate: Date | null = null;

        tracks.forEach( track => {
            for( const schedule of track ) {
                if( !earliestDate || schedule.startDate < earliestDate ) {
                    earliestDate = schedule.startDate;
                }
                if( !latestDate || schedule.endDate > latestDate ) {
                    latestDate = schedule.endDate;
                }
            }
        } );

        return { earliestDate, latestDate };
    }

    /**
     * Renders the top-left corner of the Gantt chart.
     * 
     * This method fills the corner canvas with a background color, adds the "Topics" title,
     * and draws a border around the corner area. The corner serves as a header for the labels
     * column and provides visual separation between the header and labels areas.
     */
    private renderCorner(): void {
        // Render corner background
        this.cornerCtx.fillStyle = this.config.headerBackgroundColor;
        this.cornerCtx.fillRect( 0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height );

        // Optionally render a title or icon in the corner
        this.cornerCtx.fillStyle = '#333';
        this.cornerCtx.font = this.config.headerFont;
        this.cornerCtx.textAlign = 'center';
        this.cornerCtx.fillText( 'Topics', this.canvases.cornerCanvas.width / 2, this.canvases.cornerCanvas.height / 2 + 5 );

        // Render border
        this.cornerCtx.strokeStyle = this.config.headerSeparatorColor;
        this.cornerCtx.strokeRect( 0, 0, this.canvases.cornerCanvas.width, this.canvases.cornerCanvas.height );
    }

    /**
     * Renders the header area of the Gantt chart with month and week labels.
     * 
     * This method handles the rendering of the time-based header that appears at the top of the chart.
     * It includes:
     * 1. A background for the header area
     * 2. Month labels in the top half of the header
     * 3. Week/day labels in the bottom half of the header
     * 4. Vertical grid lines to indicate month and week boundaries
     * 5. A separator line at the bottom of the header
     * 
     * The method also calculates and returns the month and week boundary indices, which are used
     * for rendering grid lines in the content area.
     * 
     * @param startDate - The start date for the chart (earliest date across all schedules)
     * @param totalDays - The total number of days to render in the chart
     * @returns An object containing arrays of indices for month and week boundaries
     */
    private renderHeader( startDate: Date, totalDays: number ):
      { monthBoundaries: number[], weekBoundaries: number[] } {

        // Render header background
        this.renderHeaderBackground();

        // Calculate the month and week boundaries
        const { months, weeks } = this.calculateTimeIntervals(startDate, totalDays);

        const monthHeight = this.config.headerHeight / 2;

        // Render month headers
        this.setupHeaderTextStyle();
        this.renderMonthHeaders(months, monthHeight);

        // Render week headers
        this.renderWeekHeaders(weeks, monthHeight);

        // Collect month and week boundary indices
        const { monthBoundaries, weekBoundaries } = this.collectBoundaryIndices(months, weeks, totalDays);

        // Render vertical grid lines in header
        this.renderHeaderGridLines(totalDays, monthBoundaries, weekBoundaries, monthHeight);

        // Render header separator line
        this.renderHeaderSeparator();

        // Return grid boundary information for content rendering
        return { monthBoundaries, weekBoundaries };
    }

    private renderHeaderBackground(): void {
        this.headerCtx.fillStyle = this.config.headerBackgroundColor;
        this.headerCtx.fillRect( 0, 0, this.canvases.headerCanvas.width, this.config.headerHeight );
    }

    private calculateTimeIntervals(startDate: Date, totalDays: number): 
      { months: { [key: string]: { start: number, end: number, label: string } }, 
        weeks: { [key: string]: { start: number, end: number, label: string } } } {

        const months: { [key: string]: { start: number, end: number, label: string } } = {};
        const weeks: { [key: string]: { start: number, end: number, label: string } } = {};

        for( let i = 0; i <= totalDays; i++ ) {
            const date = dayjs( startDate ).add( i, 'day' );
            const monthKey = date.format( 'YYYY-MM' );
            const weekKey = `${ date.year() }-${ date.isoWeek() }`;

            // Track months
            if( !months[monthKey] ) {
                months[monthKey] = {
                    start: i,
                    end: i,
                    label: date.format( 'MMM-YY' )
                };
            }
            else {
                months[monthKey].end = i;
            }

            // Track weeks
            if( !weeks[weekKey] ) {
                weeks[weekKey] = {
                    start: i,
                    end: i,
                    label: `${ date.date() }`
                };
            }
            else {
                weeks[weekKey].end = i;
            }
        }

        return { months, weeks };
    }

    private setupHeaderTextStyle(): void {
        this.headerCtx.fillStyle = '#333';
        this.headerCtx.font = this.config.headerFont;
        this.headerCtx.textAlign = 'center';
    }

    private renderMonthHeaders(months: { [key: string]: { start: number, end: number, label: string } }, monthHeight: number): void {
        Object.values( months ).forEach( month => {
            const startX = month.start * this.config.dayWidth;
            const endX = month.end * this.config.dayWidth;
            const width = endX - startX + this.config.dayWidth;

            // Draw month background
            this.headerCtx.fillStyle = this.config.headerBackgroundColor;
            this.headerCtx.fillRect( startX, 0, width, monthHeight );

            // Draw month border
            this.headerCtx.strokeStyle = this.config.gridLineColor;
            this.headerCtx.strokeRect( startX, 0, width, monthHeight );

            // Draw a month label
            this.headerCtx.fillStyle = '#333';
            this.headerCtx.fillText( month.label, startX + ( width / 2 ), monthHeight / 2 + 5 );
        } );
    }

    private renderWeekHeaders(weeks: { [key: string]: { start: number, end: number, label: string } }, monthHeight: number): void {
        Object.values( weeks ).forEach( week => {
            const startX = week.start * this.config.dayWidth;
            const endX = week.end * this.config.dayWidth;
            const width = endX - startX + this.config.dayWidth;

            // Draw week background
            this.headerCtx.fillStyle = this.config.headerBackgroundColor;
            this.headerCtx.fillRect( startX, monthHeight, width, monthHeight );

            // Draw week border
            this.headerCtx.strokeStyle = this.config.gridLineColor;
            this.headerCtx.strokeRect( startX, monthHeight, width, monthHeight );

            // Draw week label
            this.headerCtx.fillStyle = '#333';
            this.headerCtx.fillText( week.label, startX + 7, monthHeight + ( monthHeight / 2 ) + 5 );
        } );
    }

    private collectBoundaryIndices(
        months: { [key: string]: { start: number, end: number, label: string } },
        weeks: { [key: string]: { start: number, end: number, label: string } },
        totalDays: number
    ): { monthBoundaries: number[], weekBoundaries: number[] } {
        const monthBoundaries: number[] = [];
        const weekBoundaries: number[] = [];

        Object.values( months ).forEach( month => {
            monthBoundaries.push( month.start );
            if( month.end < totalDays ) {
                monthBoundaries.push( month.end + 1 );
            }
        } );

        Object.values( weeks ).forEach( week => {
            weekBoundaries.push( week.start );
            if( week.end < totalDays ) {
                weekBoundaries.push( week.end + 1 );
            }
        } );

        return { monthBoundaries, weekBoundaries };
    }

    private renderHeaderGridLines(totalDays: number, monthBoundaries: number[], weekBoundaries: number[], monthHeight: number): void {
        for( let i = 0; i <= totalDays; i++ ) {
            const x = i * this.config.dayWidth;

            // Determine grid line color for header based on boundaries
            let headerGridColor = this.config.gridLineColor;
            let isMonthBoundary = monthBoundaries.includes( i );
            let isWeekBoundary = weekBoundaries.includes( i );

            if( isMonthBoundary ) {
                headerGridColor = this.config.monthGridLineColor;
            }
            else if( isWeekBoundary ) {
                headerGridColor = this.config.weekGridLineColor;
            }

            // Draw grid line in header area
            // For month row (top half), only draw month boundary lines
            if( isMonthBoundary ) {
                this.headerCtx.beginPath();
                this.headerCtx.moveTo( x, 0 );
                this.headerCtx.lineTo( x, monthHeight );
                this.headerCtx.strokeStyle = this.config.monthGridLineColor;
                this.headerCtx.stroke();
            }

            // For week row (bottom half), draw both month and week boundary lines
            this.headerCtx.beginPath();
            this.headerCtx.moveTo( x, monthHeight );
            this.headerCtx.lineTo( x, this.config.headerHeight );
            this.headerCtx.strokeStyle = headerGridColor;
            this.headerCtx.stroke();
        }
    }

    private renderHeaderSeparator(): void {
        this.headerCtx.beginPath();
        this.headerCtx.moveTo( 0, this.config.headerHeight - 1 );
        this.headerCtx.lineTo( this.canvases.headerCanvas.width, this.config.headerHeight - 1 );
        this.headerCtx.strokeStyle = this.config.headerSeparatorColor;
        this.headerCtx.stroke();
    }

    private renderVerticalGridLines(
      y: number,
      totalDays: number,
      monthBoundaries?: number[],
      weekBoundaries?: number[],
      isTrackHeader: boolean = false
    ): void {
        // If we don't have boundaries, calculate them based on the current date
        if( !monthBoundaries || !weekBoundaries ) {
            const { calculatedMonthBoundaries, calculatedWeekBoundaries } = this.calculateDefaultBoundaries(totalDays);
            monthBoundaries = calculatedMonthBoundaries;
            weekBoundaries = calculatedWeekBoundaries;
        }

        // Render grid lines based on track type
        if( isTrackHeader ) {
            this.renderTrackHeaderGridLines(y, monthBoundaries, weekBoundaries);
        } else {
            this.renderTopicRowGridLines(y, totalDays, monthBoundaries, weekBoundaries);
        }
    }

    private calculateDefaultBoundaries(totalDays: number): { calculatedMonthBoundaries: number[], calculatedWeekBoundaries: number[] } {
        const today = new Date();
        const startDate = new Date( today.getFullYear(), today.getMonth(), 1 ); // Start from the first day of current month

        // Calculate month and week boundaries
        const months: { [key: string]: { start: number, end: number } } = {};
        const weeks: { [key: string]: { start: number, end: number } } = {};

        for( let i = 0; i <= totalDays; i++ ) {
            const date = dayjs( startDate ).add( i, 'day' );
            const monthKey = date.format( 'YYYY-MM' );
            const weekKey = `${ date.year() }-${ date.isoWeek() }`;

            // Track months
            if( !months[monthKey] ) {
                months[monthKey] = { start: i, end: i };
            }
            else {
                months[monthKey].end = i;
            }

            // Track weeks
            if( !weeks[weekKey] ) {
                weeks[weekKey] = { start: i, end: i };
            }
            else {
                weeks[weekKey].end = i;
            }
        }

        // Convert to arrays of boundary indices
        const calculatedMonthBoundaries: number[] = [];
        const calculatedWeekBoundaries: number[] = [];

        Object.values( months ).forEach( month => {
            calculatedMonthBoundaries.push( month.start );
            if( month.end < totalDays ) {
                calculatedMonthBoundaries.push( month.end + 1 );
            }
        } );

        Object.values( weeks ).forEach( week => {
            calculatedWeekBoundaries.push( week.start );
            if( week.end < totalDays ) {
                calculatedWeekBoundaries.push( week.end + 1 );
            }
        } );

        return { calculatedMonthBoundaries, calculatedWeekBoundaries };
    }

    private renderTrackHeaderGridLines(y: number, monthBoundaries: number[], weekBoundaries: number[]): void {
        // Render month boundaries
        this.renderMonthBoundaryLines(y, monthBoundaries);

        // Render week boundaries (skip if also a month boundary)
        this.renderWeekBoundaryLines(y, weekBoundaries, monthBoundaries);
    }

    private renderMonthBoundaryLines(y: number, monthBoundaries: number[]): void {
        monthBoundaries.forEach( i => {
            const x = i * this.config.dayWidth;
            this.contentCtx.beginPath();
            this.contentCtx.moveTo( x, y );
            this.contentCtx.lineTo( x, y + this.config.rowHeight );
            this.contentCtx.strokeStyle = this.config.monthGridLineColor;
            this.contentCtx.stroke();
        } );
    }

    private renderWeekBoundaryLines(y: number, weekBoundaries: number[], monthBoundaries: number[]): void {
        weekBoundaries.forEach( i => {
            if( !monthBoundaries.includes( i ) ) {
                const x = i * this.config.dayWidth;
                this.contentCtx.beginPath();
                this.contentCtx.moveTo( x, y );
                this.contentCtx.lineTo( x, y + this.config.rowHeight );
                this.contentCtx.strokeStyle = this.config.weekGridLineColor;
                this.contentCtx.stroke();
            }
        } );
    }

    private renderTopicRowGridLines(y: number, totalDays: number, monthBoundaries: number[], weekBoundaries: number[]): void {
        // For topic rows, render all grid lines
        for( let i = 0; i <= totalDays; i++ ) {
            const x = i * this.config.dayWidth;

            // Determine grid line color based on boundaries
            let gridColor = this.determineGridLineColor(i, monthBoundaries, weekBoundaries);

            // Draw grid line
            this.drawGridLine(x, y, gridColor);
        }
    }

    private determineGridLineColor(dayIndex: number, monthBoundaries: number[], weekBoundaries: number[]): string {
        let gridColor = this.config.gridLineColor; // Default to day grid line color
        const isMonthBoundary = monthBoundaries.includes( dayIndex );
        const isWeekBoundary = weekBoundaries.includes( dayIndex );

        if( isMonthBoundary ) {
            gridColor = this.config.monthGridLineColor;
        }
        else if( isWeekBoundary ) {
            gridColor = this.config.weekGridLineColor;
        }

        return gridColor;
    }

    private drawGridLine(x: number, y: number, color: string): void {
        this.contentCtx.beginPath();
        this.contentCtx.moveTo( x, y );
        this.contentCtx.lineTo( x, y + this.config.rowHeight );
        this.contentCtx.strokeStyle = color;
        this.contentCtx.stroke();
    }

    private renderTopicLabel( schedule: TopicSchedule, y: number, trackIndex: number = 0 ): void {
        // Get background color based on track index
        let bgColor = this.config.trackBgColors && this.config.trackBgColors.length > 0
            ? this.config.trackBgColors[trackIndex % this.config.trackBgColors.length]
            : this.config.trackHeaderBackgroundColor;

        if( schedule.selected ) {
            bgColor = this.config.selectedTopicBackgroundColor ;
        }

        // Apply a very light background for the topic row
        this.labelsCtx.fillStyle = bgColor;
        this.labelsCtx.fillRect( 0, y, this.canvases.labelsCanvas.width, this.config.rowHeight );

        // Render topic name in labels canvas
        this.labelsCtx.fillStyle = '#333';
        this.labelsCtx.font = this.config.topicFont;
        this.labelsCtx.textAlign = 'left';
        this.labelsCtx.fillText( schedule.topic.topicName, 20, y + ( this.config.rowHeight / 2 ) + 4 );

        // Render row separator line
        this.labelsCtx.beginPath();
        this.labelsCtx.moveTo( 0, y + this.config.rowHeight );
        this.labelsCtx.lineTo( this.canvases.labelsCanvas.width, y + this.config.rowHeight );
        this.labelsCtx.strokeStyle = this.config.rowSeparatorColor;
        this.labelsCtx.stroke();
    }

    /**
     * Renders the blocks representing different phases of a topic schedule.
     * 
     * This method handles the rendering of the visual representation of a topic schedule in the
     * content canvas. For each topic schedule, it:
     * 1. Applies a background color for the entire row
     * 2. Calculates the position and dimensions based on the schedule dates
     * 3. Renders grid lines to align with month and week boundaries
     * 4. Renders colored blocks for each phase of the topic (coaching, self-study, exercise, consolidation)
     * 5. Adds a separator line at the bottom of the row
     * 
     * The blocks are color-coded according to the phase they represent, making it easy to
     * visually distinguish between different phases of the topic schedule.
     * 
     * @param schedule - The topic schedule to render
     * @param chartStartDate - The start date of the chart (for positioning calculation)
     * @param y - The vertical position where the blocks should be rendered
     * @param trackIndex - The index of the track containing this schedule (for color selection)
     */
    private renderTopicBlocks( schedule: TopicSchedule, chartStartDate: Date, y: number, trackIndex: number = 0 ): void {
        // Apply background for the topic row
        const bgColor = this.getTopicBackgroundColor(schedule, trackIndex);
        this.applyTopicRowBackground(y, bgColor);

        // Calculate position and dimensions
        const { startX, width, totalDays } = this.calculateTopicPosition(schedule, chartStartDate);

        // Get the total days in the chart from the canvas width
        const totalDaysInChart = Math.ceil( this.canvases.contentCanvas.width / this.config.dayWidth );

        // Calculate and render grid lines
        const { monthBoundaries, weekBoundaries } = this.calculateChartBoundaries(chartStartDate, totalDaysInChart);
        this.renderVerticalGridLines( y, totalDaysInChart, monthBoundaries, weekBoundaries, false );

        // Render phase blocks
        this.renderPhaseBlocks(schedule, y, startX, width, totalDays);

        // Render row separator line
        this.renderRowSeparator(y);
    }

    private getTopicBackgroundColor(schedule: TopicSchedule, trackIndex: number): string {
        let bgColor = this.config.trackBgColors && this.config.trackBgColors.length > 0
            ? this.config.trackBgColors[trackIndex % this.config.trackBgColors.length]
            : this.config.trackHeaderBackgroundColor;

        if( schedule.selected ) {
            bgColor = this.config.selectedTopicBackgroundColor;
        }

        return bgColor;
    }

    private applyTopicRowBackground(y: number, bgColor: string): void {
        this.contentCtx.fillStyle = bgColor;
        this.contentCtx.fillRect( 0, y, this.canvases.contentCanvas.width, this.config.rowHeight );
    }

    private calculateTopicPosition(schedule: TopicSchedule, chartStartDate: Date): 
      { startX: number, width: number, totalDays: number } {
        const startDays = dayjs( schedule.startDate ).diff( chartStartDate, 'day' );
        const totalDays = schedule.numDays + schedule.interTopicGapNumDays;

        const startX = startDays * this.config.dayWidth;
        const width = totalDays * this.config.dayWidth;

        return { startX, width, totalDays };
    }

    private calculateChartBoundaries(chartStartDate: Date, totalDaysInChart: number): 
      { monthBoundaries: number[], weekBoundaries: number[] } {
        // Calculate month and week boundaries based on the chart start date
        const months: { [key: string]: { start: number, end: number } } = {};
        const weeks: { [key: string]: { start: number, end: number } } = {};

        for( let i = 0; i <= totalDaysInChart; i++ ) {
            const date = dayjs( chartStartDate ).add( i, 'day' );
            const monthKey = date.format( 'YYYY-MM' );
            const weekKey = `${ date.year() }-${ date.isoWeek() }`;

            // Track months
            if( !months[monthKey] ) {
                months[monthKey] = { start: i, end: i };
            }
            else {
                months[monthKey].end = i;
            }

            // Track weeks
            if( !weeks[weekKey] ) {
                weeks[weekKey] = { start: i, end: i };
            }
            else {
                weeks[weekKey].end = i;
            }
        }

        // Convert to arrays of boundary indices
        const monthBoundaries: number[] = [];
        const weekBoundaries: number[] = [];

        Object.values( months ).forEach( month => {
            monthBoundaries.push( month.start );
            if( month.end < totalDaysInChart ) {
                monthBoundaries.push( month.end + 1 );
            }
        } );

        Object.values( weeks ).forEach( week => {
            weekBoundaries.push( week.start );
            if( week.end < totalDaysInChart ) {
                weekBoundaries.push( week.end + 1 );
            }
        } );

        return { monthBoundaries, weekBoundaries };
    }

    private renderPhaseBlocks(schedule: TopicSchedule, y: number, startX: number, width: number, totalDays: number): void {
        // Calculate widths for each phase
        const phaseWidths = this.calculatePhaseWidths(schedule, width, totalDays);

        // Render the blocks in content canvas
        let currentX = startX;

        // Coaching block
        if( schedule.coachingNumDays > 0 ) {
            this.renderBlock( currentX, y, phaseWidths.coaching, this.config.phaseColors.coaching );
            currentX += phaseWidths.coaching;
        }

        // Self-Study block
        if( schedule.selfStudyNumDays > 0 ) {
            this.renderBlock( currentX, y, phaseWidths.selfStudy, this.config.phaseColors.selfStudy );
            currentX += phaseWidths.selfStudy;
        }

        // Exercise block
        if( schedule.exerciseNumDays > 0 ) {
            this.renderBlock( currentX, y, phaseWidths.exercise, this.config.phaseColors.exercise );
            currentX += phaseWidths.exercise;
        }

        // Consolidation block
        if( schedule.consolidationNumDays > 0 ) {
            this.renderBlock( currentX, y, phaseWidths.consolidation, this.config.phaseColors.consolidation );
            currentX += phaseWidths.consolidation;
        }

        // Inter-topic gap
        if( schedule.interTopicGapNumDays > 0 ) {
            this.renderBlock( currentX, y, phaseWidths.interTopicGap, this.config.phaseColors.interTopicGap );
        }
    }

    private calculatePhaseWidths(schedule: TopicSchedule, width: number, totalDays: number): 
      { coaching: number, selfStudy: number, exercise: number, consolidation: number, interTopicGap: number } {
        return {
            coaching: ( schedule.coachingNumDays / totalDays ) * width,
            selfStudy: ( schedule.selfStudyNumDays / totalDays ) * width,
            exercise: ( schedule.exerciseNumDays / totalDays ) * width,
            consolidation: ( schedule.consolidationNumDays / totalDays ) * width,
            interTopicGap: ( schedule.interTopicGapNumDays / totalDays ) * width
        };
    }

    private renderRowSeparator(y: number): void {
        this.contentCtx.beginPath();
        this.contentCtx.moveTo( 0, y + this.config.rowHeight );
        this.contentCtx.lineTo( this.canvases.contentCanvas.width, y + this.config.rowHeight );
        this.contentCtx.strokeStyle = this.config.rowSeparatorColor;
        this.contentCtx.stroke();
    }

    private renderBlock( x: number, y: number, width: number, color: string ): void {
        const height = this.config.rowHeight - 6;
        const blockY = y + 3;

        // Render block background
        this.contentCtx.fillStyle = color;
        this.contentCtx.fillRect( x, blockY, width, height );

        // Render block border
        this.contentCtx.strokeStyle = this.config.blockBorderColor;
        this.contentCtx.lineWidth = 0.5;
        this.contentCtx.strokeRect( x, blockY, width, height );
    }
}
