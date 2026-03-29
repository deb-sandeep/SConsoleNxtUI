import { DrawingArea, TimeSequenceConfig } from "./time-sequence-renderer";

export class TimeMarkerRenderer {

    private markerLabel : string ;

    constructor(
      private timeMarker: number,
      private examDuration: number,
      private headerArea: DrawingArea,
      private contentArea: DrawingArea,
      private config: TimeSequenceConfig
    ) {
        this.markerLabel = this.computeMarkerLabel() ;
    }

    private computeMarkerLabel() {
        const hours   = Math.floor( this.timeMarker/3600 ) ;
        const minutes = Math.floor( (this.timeMarker - hours*3600 )/60 ) ;

        return hours.toString().padStart( 1, '0' ) + ":" +
               minutes.toString().padStart(2, '0' ) ;
    }

    renderTimeMarker() {
        this.renderHeaderTimeMarker() ;
        this.renderContentTimeMarker() ;
    }

    private renderHeaderTimeMarker() {

        const minuteWidth = this.config.units.minuteWidth ;
        const y = this.config.headerConfig.lapHdrHeight +
                           this.config.headerConfig.lapHdrHeight - 5 ;

        const g = this.headerArea.g ;
        const textWidth = g.measureText( this.markerLabel ).width ;

        let x = minuteWidth * ( this.timeMarker / 60 ) ;
        if( this.timeMarker > 0 && this.timeMarker < this.examDuration ) {
            x -= textWidth/2 ;
        }
        else if( this.timeMarker == this.examDuration ) {
            x -= (textWidth + 3) ;
        }

        g.save() ;
        g.fillStyle = "#252525" ;
        g.font = this.config.headerConfig.timeFont ;
        g.textBaseline = "bottom" ;
        g.fillText( this.markerLabel, x, y-2 ) ;

        g.restore() ;
    }

    private renderContentTimeMarker() {

        const minuteWidth = this.config.units.minuteWidth ;
        let x = minuteWidth * ( this.timeMarker / 60 ) ;

        const g = this.contentArea.g ;

        if( this.timeMarker == 0 ) {
            x += 1 ;
        }
        else if( this.timeMarker == this.examDuration ) {
            x -= 1 ;
        }

        g.save() ;
        g.strokeStyle = this.config.timelineConfig.lineColor ;
        g.moveTo( x, 0 ) ;
        g.lineTo( x, this.contentArea.canvas.height ) ;
        g.stroke() ;

        g.restore() ;
    }
}