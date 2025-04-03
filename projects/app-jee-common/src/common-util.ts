export class SConsoleUtil {

  public static getProblemIcon( state: string ) {
    switch( state ) {
      case 'Assigned': return 'bi-crosshair icon' ;
      case 'Later': return 'bi-calendar2-event icon' ;
      case 'Redo': return 'bi-arrow-clockwise icon' ;
      case 'Pigeon': return 'bi-twitter icon' ;
      case 'Pigeon Solved': return 'bi-twitter icon-green' ;
      default: return 'bi-crosshair icon' ;
    }
  }
}