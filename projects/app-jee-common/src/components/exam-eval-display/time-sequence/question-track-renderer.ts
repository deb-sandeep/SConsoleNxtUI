import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { TimeSequenceConfig } from "./time-sequence-renderer";

interface TrackBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class QuestionTrack {

    trackIndex: number;
    bgColor: string;
    name : string ;
    labelBounds : TrackBounds;
    timelineBounds : TrackBounds;

    constructor(
      private attempt: ExamQuestionAttemptSO,
      private labelCanvas: HTMLCanvasElement,
      private labelCanvasCtx: CanvasRenderingContext2D,
      private contentCanvas: HTMLCanvasElement,
      private contentCanvasCtx: CanvasRenderingContext2D,
      private config: TimeSequenceConfig
    ) {
        this.trackIndex = attempt.examQuestion.sequence - 1;
        this.name = this.constructName() ;
        this.bgColor = this.deduceBgColor() ;
    }

    private constructName() {
        const syllabus = this.attempt.examQuestion.question.syllabusName ;
        const problemType = this.attempt.examQuestion.question.problemType ;
        const sequence = this.attempt.examQuestion.sequence ;

        return syllabus.charAt(4) + " " +
          problemType + " " +
          sequence.toString().padStart( 2, '0' ) ;
    }

    private deduceBgColor() {
        const nameFirstLetter = this.name.charAt( 0 ) ;
        const colors = this.config.syllabusColors ;

        if( nameFirstLetter.startsWith( "P" ) ) {
            return colors.physics ;
        }
        else if( nameFirstLetter.startsWith( "C" ) ) {
            return colors.chemistry ;
        }
        return colors.maths ;
    }

    public recomputeTrackBounds() : void {
        // Tracks are stacked row-by-row, so both canvases share the same Y and height.
        const sharedY = this.getTrackY( this.trackIndex ) ;
        const sharedHeight = this.getTrackRenderableHeight() ;

        this.labelBounds = {
            x: this.config.labelConfig.leftMargin,
            y: sharedY,
            width: this.getLabelTrackWidth(),
            height: sharedHeight,
        } ;

        this.timelineBounds = {
            x: this.config.timelineConfig.marginLeft,
            y: sharedY,
            width: this.getTimelineTrackWidth(),
            height: sharedHeight,
        } ;
    }

    private getTrackY( trackIndex: number ) : number {
        return ( trackIndex * this.config.units.trackHeight ) + this.config.trackConfig.topMargin ;
    }

    private getTrackRenderableHeight() : number {
        const verticalMargins = this.config.trackConfig.topMargin +
          this.config.trackConfig.bottomMargin ;
        return Math.max( 0, this.config.units.trackHeight - verticalMargins ) ;
    }

    private getLabelTrackWidth() : number {
        let labelCfg = this.config.labelConfig;
        return Math.max(
          0,
          labelCfg.labelWidth - labelCfg.leftMargin - labelCfg.rightMargin
        ) ;
    }

    private getTimelineTrackWidth() : number {
        return Math.max(
          0,
          this.contentCanvas.width -
          this.config.timelineConfig.marginLeft -
          this.config.timelineConfig.marginRight
        ) ;
    }

    public renderLabel() {
        this.labelCanvasCtx.save() ;

        // Label rendering uses the precomputed label bounds so the label column stays
        // aligned with the matching timeline row.
        this.labelCanvasCtx.fillStyle = this.bgColor ;
        this.labelCanvasCtx.fillRect(
            this.labelBounds.x,
            this.labelBounds.y,
            this.labelBounds.width,
            this.labelBounds.height
        ) ;

        this.labelCanvasCtx.restore() ;
    }

    public renderTimeline() {
        this.contentCanvasCtx.save() ;

        // Timeline rendering uses the precomputed timeline bounds so the content area
        // shares the same vertical placement as the label row.
        this.contentCanvasCtx.fillStyle = this.bgColor ;
        this.contentCanvasCtx.fillRect(
            this.timelineBounds.x,
            this.timelineBounds.y,
            this.timelineBounds.width,
            this.timelineBounds.height
        ) ;

        this.contentCanvasCtx.restore() ;
    }
}
