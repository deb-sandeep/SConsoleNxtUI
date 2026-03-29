import { DrawingArea, TimeSequenceConfig } from "./time-sequence-renderer";
import { LapName } from "@jee-common/util/exam-data-types";

export class LapMarkerRenderer {

    constructor(
      private lapName: LapName,
      private startTimeMarker: number,
      private endTimeMarker: number,
      private headerArea: DrawingArea,
      private contentArea: DrawingArea,
      private config: TimeSequenceConfig
    ) {}

    renderLapBackground() {
        const minuteWidth = this.config.units.minuteWidth ;
        const startX = minuteWidth * ( this.startTimeMarker / 60000 ) ;
        const endX = minuteWidth * ( this.endTimeMarker / 60000 ) ;
        const bgColor:string = this.config.lapConfig.colors[ this.lapName ] ;

        this.renderHeaderLapBackground( startX, endX, bgColor ) ;
        this.renderContentLapBackground( startX, endX, bgColor ) ;
    }

    private renderHeaderLapBackground( startX: number, endX: number, bgColor:string ) {

        const g = this.headerArea.g ;

        g.save() ;
        g.fillStyle = bgColor;
        g.fillRect( startX, 0, endX - startX, this.headerArea.canvas.height );

        g.font = this.config.headerConfig.lapFont ;
        g.fillStyle = '#000000';
        g.textAlign = 'center';
        g.textBaseline = 'top';

        const centerX = startX + ( endX - startX ) / 2;
        g.fillText( this.lapName, centerX, 5 );

        g.restore() ;
    }

    private renderContentLapBackground( startX: number, endX: number, bgColor:string ) {

        const g = this.contentArea.g ;

        g.save() ;
        g.fillStyle = bgColor;
        g.fillRect( startX, 0, endX - startX, this.contentArea.canvas.height );
        g.restore() ;
    }
}
