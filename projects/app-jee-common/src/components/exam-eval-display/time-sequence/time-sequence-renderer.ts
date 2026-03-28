import { ExamAttemptSO } from "@jee-common/util/exam-data-types";
import { QuestionTrackRenderer } from "./question-track-renderer";
import { TimeMarkerRenderer } from "./time-marker-renderer";

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
        fontName : string ;
        fontSize: number ;
        leftMargin : number ;
        rightMargin : number ;
    }
    timelineConfig : {
        lineColor: string,
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

export interface DrawingArea {
    canvas: HTMLCanvasElement;
    g: CanvasRenderingContext2D;
}

export class TimeSequenceRenderer {

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
            lapHdrHeight : 20,
            timeHeaderHeight : 20,
            lapFont : '11px Arial',
            timeFont: '11px Arial' ,
        },
        labelConfig : {
            labelWidth: 70,
            rowHeight : 20,
            fontName : 'Courier',
            fontSize: 12,
            leftMargin : 5,
            rightMargin : 0,
        },
        timelineConfig : {
            lineColor : '#dadada',
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

    private eval : ExamAttemptSO ;

    private readonly headerArea: DrawingArea ;
    private readonly labelsArea: DrawingArea ;
    private readonly contentArea: DrawingArea ;

    private scale: number = 1 ;

    private qTracks: QuestionTrackRenderer[] = [];
    private timeMarkers: TimeMarkerRenderer[] = [];

    constructor( attempt: ExamAttemptSO,
                 config: Partial<TimeSequenceConfig>,
                 headerCanvas: HTMLCanvasElement,
                 labelsCanvas: HTMLCanvasElement,
                 contentCanvas : HTMLCanvasElement ) {

        this.eval = attempt ;
        this.headerArea  = { canvas: headerCanvas,  g: headerCanvas.getContext( '2d' )! } ;
        this.labelsArea  = { canvas: labelsCanvas,  g: labelsCanvas.getContext( '2d' )! } ;
        this.contentArea = { canvas: contentCanvas, g: contentCanvas.getContext( '2d' )! } ;

        // Override defaults with the provided config
        if( config ) {
            this.config = { ...this.config, ...config };
        }
        this.createQuestionTracks() ;
        this.createTimeMarkers() ;
    }

    private createQuestionTracks()  {
        for( let sectionAttempt of this.eval.sectionAttempts ) {
            for( let qAttempt of sectionAttempt.questionAttempts ) {
                this.qTracks.push( new QuestionTrackRenderer(
                  qAttempt,
                  this.labelsArea,
                  this.contentArea,
                  this.config ) ) ;
            }
        }
    }

    private createTimeMarkers() {

        // duration is in seconds
        const examDuration = this.eval.exam.duration ;

        // If exam duration is less than or equal to an hour,
        // mark out 5-minute intervals, if the exam is between 1-2 hours,
        // mark out 10-minute intervals, else mark out 15 minute intervals
        let markerDuration = 5*60 ;
        if( examDuration > 60*60 && examDuration < 2*60*60 ) {
            markerDuration = 10*60 ;
        }
        else if( examDuration > 7200 ) {
            markerDuration = 15*60 ;
        }

        this.timeMarkers.push( this.createTimeMarkerRenderer( 0 ) ) ;
        for( let i=300; i<examDuration; i+=300 ) {
            this.timeMarkers.push( this.createTimeMarkerRenderer( i ) ) ;
        }
        this.timeMarkers.push( this.createTimeMarkerRenderer( examDuration ) ) ;
    }

    private createTimeMarkerRenderer( timeMarker: number ) {
        return new TimeMarkerRenderer(
          timeMarker,
          this.eval.exam.duration,
          this.headerArea,
          this.contentArea,
          this.config
        ) ;
    }

    public resizeCanvases(): void {

        // Get container dimensions
        const contentContainer = this.contentArea.canvas.parentElement!;
        if( contentContainer.clientHeight === 0 ) {
            this.headerArea.canvas.height = 0;
            this.labelsArea.canvas.height = 0;
            this.contentArea.canvas.height = 0;
            return ;
        }

        const headerHeight = this.config.headerConfig.timeHeaderHeight +
          this.config.headerConfig.lapHdrHeight ;

        // Resize header canvas (full width, header height)
        this.headerArea.canvas.width = contentContainer.clientWidth;
        this.headerArea.canvas.height = headerHeight ;

        // Resize labels canvas (label width, full height)
        this.labelsArea.canvas.width = this.config.labelConfig.labelWidth ;
        this.labelsArea.canvas.height = contentContainer.clientHeight;

        // Resize content canvas - use scrollWidth to ensure it's wide enough for scrolling
        // Note: We'll adjust this width further in renderGanttChart if needed
        this.contentArea.canvas.width = contentContainer.clientWidth;
        this.contentArea.canvas.height = contentContainer.clientHeight;

        this.calculateUnits() ;
        this.render() ;
    }

    private calculateUnits() : void {
        const exam = this.eval.exam ;
        const minutes = exam.duration/60 ;
        const numQuestions = exam.numChemQuestions + exam.numPhyQuestions + exam.numMathQuestions ;

        const contentWidth = this.contentArea.canvas.width ;
        const contentHeight = this.contentArea.canvas.height ;

        let minuteWidth = contentWidth / minutes ;
        let questionRowHeight = contentHeight / numQuestions ;

        this.config.units.defaultMinuteWidth = minuteWidth ;
        this.config.units.minuteWidth = minuteWidth * this.scale ;

        this.config.units.defaultTrackHeight = questionRowHeight ;
        this.config.units.trackHeight = questionRowHeight * this.scale ;
    }

    public render(): void {
        this.clearAllCanvases() ;
        this.resizeCanvasesIfNeeded() ;
        this.renderChartComponents() ;
    }

    private clearAllCanvases(): void {
        this.headerArea.g.clearRect( 0, 0, this.headerArea.canvas.width, this.headerArea.canvas.height ) ;
        this.labelsArea.g.clearRect( 0, 0, this.labelsArea.canvas.width, this.labelsArea.canvas.height ) ;
        this.contentArea.g.clearRect( 0, 0, this.contentArea.canvas.width, this.contentArea.canvas.height ) ;
    }

    private resizeCanvasesIfNeeded(): void {

        const exam = this.eval.exam ;
        const duration = exam.duration ;
        const numQuestions = exam.numChemQuestions + exam.numPhyQuestions + exam.numMathQuestions ;

        let reqContentWidth = (duration/60) * this.config.units.minuteWidth ;
        let reqContentHeight = numQuestions * this.config.units.trackHeight ;

        if( reqContentHeight > this.labelsArea.canvas.height ) {
            this.labelsArea.canvas.height = reqContentHeight;
            this.contentArea.canvas.height = reqContentHeight;
        }

        if( reqContentWidth > this.headerArea.canvas.width ) {
            this.headerArea.canvas.width = reqContentWidth;
            this.contentArea.canvas.width = reqContentWidth;
        }
    }

    private renderChartComponents(): void {
        this.renderQuestionTracks() ;
        this.renderLaps() ;
        this.renderTimeMarkers() ;
    }

    private renderQuestionTracks() {
        for( let track of this.qTracks ) {
            track.recomputeTrackBounds() ;
            track.renderTrack() ;
        }
    }

    private renderLaps() {
    }

    private renderTimeMarkers(){
        for( let marker of this.timeMarkers ) {
            marker.renderTimeMarker() ;
        }
    }


    zoomIn() {
        if( this.scale <= 2.8 ) {
            this.scale += 0.2 ;
            this.resizeCanvases() ;
        }
    }

    zoomOut() {
        if( this.scale >= 1.2 ) {
            this.scale -= 0.2 ;
            this.resizeCanvases() ;
        }
    }

    zoomToFullSize() {
        if( this.scale != 1 ) {
            this.scale = 1 ;
            this.resizeCanvases() ;
        }
    }
}
