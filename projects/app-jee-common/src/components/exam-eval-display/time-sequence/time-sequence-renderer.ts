import { ExamAttemptSO } from "@jee-common/util/exam-data-types";
import { QuestionTrack } from "./question-track-renderer";

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
    syllabusColors : {
        physics: string ;
        chemistry: string ;
        maths : string ;
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

export class TimeSequenceRenderer {

    private eval : ExamAttemptSO ;

    private canvases: TimeSequenceCanvases ;
    private ctx: CanvasContexts ;
    private scale: number = 1 ;

    private readonly config: TimeSequenceConfig = {
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
        },
        syllabusColors : {
            physics : "#FFC468",
            chemistry : "#84FF85",
            maths : "#97D6FF",
        }
    } ;

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
                this.qTracks.push( new QuestionTrack(
                  qAttempt,
                  this.canvases.labels,
                  this.ctx.labels,
                  this.canvases.content,
                  this.ctx.content,
                  this.config ) ) ;
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
        this.renderLabels() ;
        this.renderTimelines() ;
        this.renderHeader();
        this.renderGanttChart();
    }

    private recomputeTrackBounds() : void {
        for( let track of this.qTracks ) {
            track.recomputeTrackBounds() ;
        }
    }

    private renderLabels() {
        for( let track of this.qTracks ) {
            track.renderLabel() ;
        }
    }

    private renderTimelines() {
        for( let track of this.qTracks ) {
            track.renderTimeline() ;
        }
    }

    private renderHeader() {
    }

    private renderGanttChart() {
    }
}
