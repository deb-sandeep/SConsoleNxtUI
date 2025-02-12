import Color from "colorjs.io"

export class Colors {

  public hue:string ;
  public titleBackground:string ;
  public titleForeground:string ;
  public bodyBackground:string ;

  constructor( color:string ) {
    this.hue = color ;
    this.computeBodyBackground() ;
    this.computeTitleBackground() ;
    this.computeTitleForeground() ;
  }

  private computeTitleBackground(){
    let color = new Color( this.hue ) ;
    color.hwb['w'] = 60 ;
    this.titleBackground = color.toString( { format:'hex' } ) ;
  }

  private computeTitleForeground(){
    let color = new Color( this.hue ) ;
    color.hsl['l'] = 20 ;
    this.titleForeground = color.toString( { format:'hex' } ) ;
  }

  private computeBodyBackground(){
    let color = new Color( this.hue ) ;
    color.hwb['w'] = 90 ;
    this.bodyBackground = color.toString( { format:'hex' } ) ;
  }
}