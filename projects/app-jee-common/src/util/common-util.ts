export class SConsoleUtil {

  public static getProblemIcon( state: string ) {
    switch( state ) {
      case 'Assigned': return 'bi-crosshair icon' ;
      case 'Correct': return 'bi-check-lg icon icon-green' ;
      case 'Incorrect': return 'bi-x-lg icon icon-red' ;
      case 'Redo': return 'bi-arrow-clockwise icon icon-red' ;
      case 'Later': return 'bi-calendar2-event icon' ;
      case 'Pigeon': return 'bi-twitter icon icon-orange' ;
      case 'Pigeon Solved': return 'bi-twitter icon icon-green' ;
      case 'Purge': return 'bi-box-arrow-up-right icon icon-green' ;
      default: return 'bi-crosshair icon' ;
    }
  }
}