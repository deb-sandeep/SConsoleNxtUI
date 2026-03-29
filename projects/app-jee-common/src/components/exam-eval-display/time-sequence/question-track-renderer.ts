import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { DrawingArea, TimeSequenceConfig } from "./time-sequence-renderer";

interface TrackBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface QuestionActivation {
    startTimeMarker: number,
    endTimeMarker: number,
}

export class QuestionTrackRenderer {

    trackIndex: number;
    bgColor: string;
    name : string ;
    labelBounds : TrackBounds;
    timelineBounds : TrackBounds;
    activations: QuestionActivation[] = [] ;

    constructor(
      private attempt: ExamQuestionAttemptSO,
      private labelsArea: DrawingArea,
      private contentArea: DrawingArea,
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
            x: 0,
            y: sharedY,
            width: this.contentArea.canvas.width,
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

    public renderTrack() {
        this.renderLabel() ;
        this.renderTimeTrack() ;
    }

    private renderLabel() {
        const g = this.labelsArea.g ;

        g.save() ;
        g.fillStyle = this.bgColor ;
        g.fillRect(
            this.labelBounds.x,
            this.labelBounds.y,
            this.labelBounds.width,
            this.labelBounds.height
        ) ;

        let fontSize = this.config.labelConfig.fontSize ;
        if( this.labelBounds.height >= 10 ) {
            fontSize = Math.min( fontSize , this.labelBounds.height ) ;
            g.fillStyle = "#252525" ;
            g.font = fontSize + 'px ' + this.config.labelConfig.fontName ;
            g.textBaseline = "middle" ;
            g.fillText( this.name,
              this.labelBounds.x + 2,
              this.labelBounds.y + this.labelBounds.height/2,
              this.labelBounds.width ) ;
        }

        g.restore() ;
    }

    private renderTimeTrack() {
        const g = this.contentArea.g ;

        g.save() ;

        g.strokeStyle = this.config.timelineConfig.lineColor ;
        g.beginPath() ;
        g.moveTo( this.timelineBounds.x, this.timelineBounds.y + this.timelineBounds.height/2 ) ;
        g.lineTo( this.timelineBounds.width, this.timelineBounds.y + this.timelineBounds.height/2 ) ;
        g.stroke() ;

        g.restore() ;
    }

    renderActivations() {
        for( let activation of this.activations ) {
            const duration = activation.endTimeMarker - activation.startTimeMarker ;
            if( duration > 3000 ) {
                this.renderActivation( activation ) ;
            }
        }
    }

    private renderActivation( activation: QuestionActivation )  {

        const minuteWidth = this.config.units.minuteWidth ;
        const startX = minuteWidth * ( activation.startTimeMarker / 60000 ) ;
        const endX = minuteWidth * ( activation.endTimeMarker / 60000 ) ;

        const g = this.contentArea.g ;

        g.save() ;

        g.fillStyle = this.config.timelineConfig.activationColor ;
        g.fillRect(
          this.timelineBounds.x + startX,
          this.timelineBounds.y + 2,
          endX - startX,
          this.timelineBounds.height - 4
        ) ;

        g.restore() ;
    }
}
