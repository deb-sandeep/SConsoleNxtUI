export interface AnswerActionIconBounds {
    centerX: number;
    centerY: number;
    size: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export class AnswerActionRenderer {

    public renderAction(
        actionName: string,
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) : void {
        if( actionName === "SAVE_&_NEXT" ) {
            this.renderSaveAndNextAction( g, iconBounds ) ;
        }
        else if( actionName === "SAVE_&_MARK_REVIEW" ) {
            this.renderSaveAndMarkReviewAction( g, iconBounds ) ;
        }
        else if( actionName === "CLEAR_RESPONSE" ) {
            this.renderClearResponseAction( g, iconBounds ) ;
        }
        else if( actionName === "MARK_REVIEW_&_NEXT" ) {
            this.renderMarkReviewAction( g, iconBounds ) ;
        }
    }

    private renderSaveAndNextAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) : void {
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
    ) : void {
        const { size, left, top, centerY } = iconBounds ;
        const circleRadius = size / 2 ;
        const circleCenterX = left + circleRadius ;
        const reviewSquareSize = size * 0.5 ;
        const reviewSquareLeft = left + size - reviewSquareSize ;
        const reviewSquareTop = top + size - reviewSquareSize ;
        const reviewCornerRadius = Math.max( 1, size * 0.06 ) ;

        // Logo5 combines the answered-state green badge with the purple
        // review marker used elsewhere in the exam UI.
        g.beginPath() ;
        g.arc( circleCenterX, centerY, circleRadius, 0, Math.PI * 2 ) ;
        g.fillStyle = '#2db13a' ;
        g.fill() ;

        g.beginPath() ;
        g.arc( circleCenterX, centerY, circleRadius, 0, Math.PI * 2 ) ;
        g.strokeStyle = '#17771f' ;
        g.lineWidth = Math.max( 1, size * 0.08 ) ;
        g.stroke() ;

        // The review badge sits on top of the circle in the icon's bottom-right corner.
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
    }

    private renderClearResponseAction(
        g: CanvasRenderingContext2D,
        iconBounds: AnswerActionIconBounds
    ) : void {
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
    ) : void {
        const { size, left, top, centerY } = iconBounds ;
        const circleRadius = size / 2 ;
        const circleCenterX = left + circleRadius ;

        // Logo4 is the plain review-state badge: a purple circular marker fully
        // contained inside the shared icon bounds.
        g.beginPath() ;
        g.arc( circleCenterX, centerY, circleRadius, 0, Math.PI * 2 ) ;
        g.fillStyle = '#5b2fbf' ;
        g.fill() ;

        g.beginPath() ;
        g.arc( circleCenterX, centerY, circleRadius, 0, Math.PI * 2 ) ;
        g.strokeStyle = '#351676' ;
        g.lineWidth = Math.max( 1, size * 0.08 ) ;
        g.stroke() ;

        // A light top-left highlight keeps the small icon from flattening out.
        g.beginPath() ;
        g.arc(
            circleCenterX - ( size * 0.10 ),
            top + ( size * 0.34 ),
            size * 0.20,
            Math.PI * 1.15,
            Math.PI * 1.85
        ) ;
        g.strokeStyle = 'rgba(255, 255, 255, 0.35)' ;
        g.lineWidth = Math.max( 0.75, size * 0.06 ) ;
        g.stroke() ;
    }
}
