import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { DrawingArea, TimeSequenceConfig } from "./time-sequence-renderer";

interface TrackBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface AnswerActionIconBounds {
    centerX: number;
    centerY: number;
    size: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface QuestionActivation {
    startTimeMarker: number,
    endTimeMarker: number,
}

export interface AnswerAction {
    actionName: string,
    timeMarker: number,
}

export class QuestionTrackRenderer {

    readonly ANS_ACTION_ICON_SIZE = 10 ;

    trackIndex: number;
    bgColor: string;
    name : string ;
    labelBounds : TrackBounds;
    timelineBounds : TrackBounds;
    activations: QuestionActivation[] = [] ;
    ansActions: AnswerAction[] = [] ;

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

    renderAnswerActions() {

        const g = this.contentArea.g ;
        const minuteWidth = this.config.units.minuteWidth ;
        const centerY = this.timelineBounds.y + ( this.timelineBounds.height / 2 ) ;
        const size = this.ANS_ACTION_ICON_SIZE ;

        for( let action of this.ansActions ) {
            const x = minuteWidth * ( action.timeMarker / 60000 ) ;
            const name = action.actionName ;
            const iconBounds = {
                centerX: x,
                centerY,
                size,
                left: x - size,
                top: centerY - ( size / 2 ),
                right: x,
                bottom: centerY + ( size / 2 ),
            } ;

            g.save() ;

            // All answer-action icons share the same placement rules: a fixed-size
            // icon box centered on the action's time marker and the track midline.
            if( name === "SAVE_&_NEXT" ) {
                this.renderSaveAndNextAction( g, iconBounds ) ;
            }
            else if( name === "SAVE_&_MARK_REVIEW" ) {
                this.renderSaveAndMarkReviewAction( g, iconBounds ) ;
            }
            else if( name === "CLEAR_RESPONSE" ) {
                this.renderClearResponseAction( g, iconBounds ) ;
            }
            else if( name === "MARK_REVIEW_&_NEXT" ) {
                this.renderMarkReviewAction( g, iconBounds ) ;
            }
            g.restore() ;
        }
    }

    private renderSaveAndNextAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) {
        const { size, left, top, right, bottom, centerY } = iconBounds ;
        const arrowBaseX = left + ( size * 0.62 ) ;

        // Keep the marker inside the requested square while approximating the
        // right-pointing green badge used by the quiz UI's Logo3 icon.
        g.beginPath() ;
        g.moveTo( left, top + ( size * 0.12 ) ) ;
        g.lineTo( arrowBaseX, top ) ;
        g.lineTo( right, centerY ) ;
        g.lineTo( arrowBaseX, bottom ) ;
        g.lineTo( left, bottom - ( size * 0.12 ) ) ;
        g.closePath() ;

        g.fillStyle = '#31b53b' ;
        g.strokeStyle = '#17771f' ;
        g.lineWidth = Math.max( 1, size * 0.08 ) ;
        g.lineJoin = 'round' ;
        g.fill() ;
        g.stroke() ;

        // A thin inner highlight keeps the icon readable at very small sizes.
        g.beginPath() ;
        g.moveTo( left + ( size * 0.16 ), top + ( size * 0.24 ) ) ;
        g.lineTo( arrowBaseX - ( size * 0.08 ), top + ( size * 0.12 ) ) ;
        g.strokeStyle = 'rgba(255, 255, 255, 0.45)' ;
        g.lineWidth = Math.max( 0.75, size * 0.06 ) ;
        g.stroke() ;
    }

    private renderSaveAndMarkReviewAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) {
        const { size, left, top } = iconBounds ;
        const circleRadius = size * 0.34 ;
        const circleCenterX = left + ( size * 0.40 ) ;
        const circleCenterY = top + ( size * 0.50 ) ;
        const reviewSquareSize = size * 0.34 ;
        const reviewSquareLeft = left + size - reviewSquareSize ;
        const reviewSquareTop = top + size - reviewSquareSize ;
        const reviewCornerRadius = Math.max( 1, size * 0.06 ) ;

        // Logo5 combines the answered-state green badge with the purple
        // review marker used elsewhere in the exam UI.
        g.beginPath() ;
        g.arc( circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2 ) ;
        g.fillStyle = '#2db13a' ;
        g.fill() ;

        g.beginPath() ;
        g.arc( circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2 ) ;
        g.strokeStyle = '#17771f' ;
        g.lineWidth = Math.max( 1, size * 0.08 ) ;
        g.stroke() ;

        // The review badge is a square anchored to the bottom-right corner.
        g.beginPath() ;
        g.roundRect(
            reviewSquareLeft,
            reviewSquareTop,
            reviewSquareSize,
            reviewSquareSize,
            reviewCornerRadius
        ) ;
        g.fillStyle = '#5b2fbf' ;
        g.fill() ;

        // A small light glyph keeps the center from reading as a flat disk at
        // the tiny timeline scale.
        g.beginPath() ;
        g.moveTo( circleCenterX - ( size * 0.12 ), circleCenterY - ( size * 0.09 ) ) ;
        g.lineTo( circleCenterX + ( size * 0.01 ), circleCenterY - ( size * 0.09 ) ) ;
        g.lineTo( circleCenterX + ( size * 0.10 ), circleCenterY + ( size * 0.01 ) ) ;
        g.lineTo( circleCenterX + ( size * 0.01 ), circleCenterY + ( size * 0.12 ) ) ;
        g.lineTo( circleCenterX - ( size * 0.12 ), circleCenterY + ( size * 0.12 ) ) ;
        g.closePath() ;
        g.fillStyle = 'rgba(255, 255, 255, 0.95)' ;
        g.fill() ;
    }

    private renderClearResponseAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) {
        const { size, left, top } = iconBounds ;
        const cornerRadius = Math.max( 1.5, size * 0.16 ) ;

        // Logo1 is essentially a light rounded square with a soft grey border.
        g.beginPath() ;
        g.roundRect( left, top, size, size, cornerRadius ) ;
        g.fillStyle = '#fafafa' ;
        g.strokeStyle = '#8f8f8f' ;
        g.lineWidth = Math.max( 1, size * 0.08 ) ;
        g.fill() ;
        g.stroke() ;

        // Add a subtle top highlight so the icon does not collapse into the
        // timeline when rendered at very small sizes.
        g.beginPath() ;
        g.roundRect(
            left + ( size * 0.12 ),
            top + ( size * 0.12 ),
            size * 0.76,
            size * 0.26,
            Math.max( 1, size * 0.08 )
        ) ;
        g.fillStyle = 'rgba(255, 255, 255, 0.55)' ;
        g.fill() ;
    }

    private renderMarkReviewAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) {
        
    }
}
