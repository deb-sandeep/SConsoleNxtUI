import { ExamAttemptSO, ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";

export interface TimeSequenceConfig {

    lapConfig : {
        colors : {
            L1 : string;
            L2P : string;
            L2 : string;
            AMR : string;
            L3P : string;
            L3_1 : string;
            L3_2 : string;
        }
    }
    trackConfig : {
        topMargin : number,
        bottomMargin : number,
    }
    headerConfig : {
        lapHdrHeight : number;
        timeHeaderHeight : number;
        lapFont : string ;
        timeFont: string ;
    }
    labelConfig : {
        labelWidth: number ;
        rowHeight : number ;
        labelFont: string ;
        leftMargin : number ;
        rightMargin : number ;
    }
    timelineConfig : {
        marginLeft: number ;
        marginRight : number ;
    }
    units : {
        defaultMinuteWidth: number ;
        defaultTrackHeight : number ;
        minuteWidth : number ;
        trackHeight : number ;
    }
}

interface TimeSequenceCanvases {
    corner: HTMLCanvasElement;
    header: HTMLCanvasElement;
    labels: HTMLCanvasElement;
    content: HTMLCanvasElement;
}

interface CanvasContexts {
    corner: CanvasRenderingContext2D;
    header: CanvasRenderingContext2D;
    labels: CanvasRenderingContext2D;
    content: CanvasRenderingContext2D;
}

interface TrackBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

class QuestionTrack {
    name : string ;
    labelBounds : TrackBounds;
    timelineBounds : TrackBounds;

    constructor( private attempt: ExamQuestionAttemptSO ) {
        this.name = this.constructName() ;
    }

    private constructName() {
        const syllabus = this.attempt.examQuestion.question.syllabusName ;
        const problemType = this.attempt.examQuestion.question.problemType ;
        const sequence = this.attempt.examQuestion.sequence ;

        return syllabus.charAt(4) + " " +
               problemType + " " +
               sequence.toString().padStart( 2, '0' ) ;
    }
}

export class TimeSequenceRenderer {

    private eval : ExamAttemptSO ;

    private canvases: TimeSequenceCanvases ;
    private ctx: CanvasContexts ;
    private scale: number = 1 ;

    private readonly config: TimeSequenceConfig;

    private qTracks: QuestionTrack[] = [];

    constructor( attempt: ExamAttemptSO,
                 config: Partial<TimeSequenceConfig>,
                 canvases: TimeSequenceCanvases ) {

        this.eval = attempt ;
        this.canvases = canvases;
        this.ctx = {
            corner : this.canvases.corner.getContext( '2d' )!,
            header : this.canvases.header.getContext( '2d' )!,
            labels : this.canvases.labels.getContext( '2d' )!,
            content : this.canvases.content.getContext( '2d' )!,
        }

        // Default configuration
        this.config = {
            lapConfig : {
                colors : {
                    L1 : "#d3d3d3",
                    L2P : "#e7b9ff",
                    L2 : "#c491fd",
                    AMR : "#aea4f8",
                    L3P : "#faa5a5",
                    L3_1 : "#be7aff",
                    L3_2 : "#fb7b7b",
                }
            },
            trackConfig : {
              topMargin: 2,
              bottomMargin: 2,
            },
            headerConfig : {
                lapHdrHeight : 15,
                timeHeaderHeight : 15,
                lapFont : '11px Arial',
                timeFont: '11px Arial' ,
            },
            labelConfig : {
                labelWidth: 70,
                rowHeight : 20,
                labelFont: '11px Courier',
                leftMargin : 5,
                rightMargin : 5,
            },
            timelineConfig : {
                marginLeft : 10,
                marginRight : 10,
            },
            units : {
                defaultMinuteWidth: 20,
                defaultTrackHeight : 30,
                minuteWidth: 20,
                trackHeight: 30,
            }
        } ;

        // Override defaults with the provided config
        if( config ) {
            this.config = { ...this.config, ...config };
        }
        this.parseExamEval() ;
    }

    public resizeCanvases(): void {

        // Get container dimensions
        const contentContainer = this.canvases.content.parentElement!;
        if( contentContainer.clientHeight === 0 ) {
            this.canvases.corner.height = 0;
            this.canvases.header.height = 0;
            this.canvases.labels.height = 0;
            this.canvases.content.height = 0;
            return ;
        }

        const headerHeight = this.config.headerConfig.timeHeaderHeight +
                                      this.config.headerConfig.lapHdrHeight ;

        // Resize corner canvas
        this.canvases.corner.width = this.config.labelConfig.labelWidth ;
        this.canvases.corner.height =  headerHeight ;

        // Resize header canvas (full width, header height)
        this.canvases.header.width = contentContainer.scrollWidth || contentContainer.clientWidth;
        this.canvases.header.height = headerHeight ;

        // Resize labels canvas (label width, full height)
        this.canvases.labels.width = this.config.labelConfig.labelWidth ;
        this.canvases.labels.height = contentContainer.scrollHeight || contentContainer.clientHeight;

        // Resize content canvas - use scrollWidth to ensure it's wide enough for scrolling
        // Note: We'll adjust this width further in renderGanttChart if needed
        this.canvases.content.width = contentContainer.scrollWidth || contentContainer.clientWidth;
        this.canvases.content.height = contentContainer.scrollHeight || contentContainer.clientHeight;

        this.calculateUnits() ;
        this.render() ;
    }

    private calculateUnits() : void {
        const exam = this.eval.exam ;
        const minutes = exam.duration/60 ;
        const numQuestions = exam.numChemQuestions + exam.numPhyQuestions + exam.numMathQuestions ;

        const contentWidth = this.canvases.content.width ;
        const contentHeight = this.canvases.content.height ;

        let minuteWidth = contentWidth / minutes ;
        let questionRowHeight = contentHeight / numQuestions ;

        this.config.units.defaultMinuteWidth = minuteWidth ;
        this.config.units.minuteWidth = minuteWidth * this.scale ;

        this.config.units.defaultTrackHeight = questionRowHeight ;
        this.config.units.trackHeight = questionRowHeight * this.scale ;
    }

    private parseExamEval()  {
        for( let sectionAttempt of this.eval.sectionAttempts ) {
            for( let qAttempt of sectionAttempt.questionAttempts ) {
                this.qTracks.push( new QuestionTrack( qAttempt ) ) ;
            }
        }
    }

    public render(): void {
        this.clearAllCanvases() ;
        this.resizeCanvasesIfNeeded() ;
        this.renderChartComponents() ;
    }

    private clearAllCanvases(): void {
        this.ctx.corner.clearRect( 0, 0, this.canvases.corner.width, this.canvases.corner.height ) ;
        this.ctx.header.clearRect( 0, 0, this.canvases.header.width, this.canvases.header.height ) ;
        this.ctx.labels.clearRect( 0, 0, this.canvases.labels.width, this.canvases.labels.height ) ;
        this.ctx.content.clearRect( 0, 0, this.canvases.content.width, this.canvases.content.height ) ;
    }

    private resizeCanvasesIfNeeded(): void {

        const exam = this.eval.exam ;
        const duration = exam.duration ;
        const numQuestions = exam.numChemQuestions + exam.numPhyQuestions + exam.numMathQuestions ;

        let reqContentWidth = (duration/60) * this.config.units.minuteWidth ;
        let reqContentHeight = numQuestions * this.config.units.trackHeight ;

        if( reqContentHeight > this.canvases.labels.height ) {
            this.canvases.labels.height = reqContentHeight;
            this.canvases.content.height = reqContentHeight;
        }

        if( reqContentWidth > this.canvases.header.width ) {
            this.canvases.header.width = reqContentWidth;
            this.canvases.content.width = reqContentWidth;
        }
    }

    private renderChartComponents(): void {
        this.recomputeTrackBounds() ;
        this.renderCorner() ;
        this.renderLabels() ;
        this.renderHeader();
        this.renderGanttChart();
    }

    private recomputeTrackBounds() : void {
        for( let trackIndex = 0; trackIndex < this.qTracks.length; trackIndex++ ) {

            // Tracks are stacked row-by-row, so both canvases share the same Y and height.
            const sharedY = this.getTrackY( trackIndex ) ;
            const sharedHeight = this.getTrackRenderableHeight() ;

            this.qTracks[trackIndex].labelBounds = this.createTrackBounds(
                this.config.labelConfig.leftMargin,
                sharedY,
                this.getLabelTrackWidth(),
                sharedHeight
            ) ;

            this.qTracks[trackIndex].timelineBounds = this.createTrackBounds(
                this.config.timelineConfig.marginLeft,
                sharedY,
                this.getTimelineTrackWidth(),
                sharedHeight
            ) ;
        }
    }

    /**
     * Tracks occupy equally stacked vertical slots based on the shared base height.
     * The top margin shifts the drawable track area down inside that slot.
     */
    private getTrackY( trackIndex: number ) : number {
        return ( trackIndex * this.config.units.trackHeight ) + this.config.trackConfig.topMargin ;
    }

    /**
     * The visible track height is the base height minus the reserved top and bottom
     * spacing, clamped so invalid configs do not produce negative bounds.
     */
    private getTrackRenderableHeight() : number {
        const verticalMargins = this.config.trackConfig.topMargin +
                                         this.config.trackConfig.bottomMargin ;
        return Math.max( 0, this.config.units.trackHeight - verticalMargins ) ;
    }

    /**
     * Label bounds use the fixed label column width and remove the label margins from
     * the left and right edges before the track text is rendered.
     */
    private getLabelTrackWidth() : number {
        return this.getRenderableWidth(
            this.config.labelConfig.labelWidth,
            this.config.labelConfig.leftMargin,
            this.config.labelConfig.rightMargin
        ) ;
    }

    /**
     * Timeline bounds use the content canvas width and remove the timeline margins so
     * drawing stays inside the intended horizontal gutter.
     */
    private getTimelineTrackWidth() : number {
        return this.getRenderableWidth(
            this.canvases.content.width,
            this.config.timelineConfig.marginLeft,
            this.config.timelineConfig.marginRight
        ) ;
    }

    /**
     * Shared width helper for both label and timeline bounds.
     */
    private getRenderableWidth( baseWidth: number, startMargin: number, endMargin: number ) : number {
        return Math.max( 0, baseWidth - startMargin - endMargin ) ;
    }

    private createTrackBounds( x: number, y: number, width: number, height: number ) : TrackBounds {
        return { x, y, width, height } ;
    }

    private renderCorner() {}

    private renderLabels() {
    }

    private renderHeader() {
    }

    private renderGanttChart() {
    }
}
