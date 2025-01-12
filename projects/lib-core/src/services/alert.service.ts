import { Injectable } from '@angular/core';

export namespace Alert {

  enum AlertType {
    INFO, WARNING, ERROR, SUCCESS
  }

  class AlertMessage {

    private static idCounter:number = 0 ;

    id:number = 0 ;

    constructor( private type: AlertType, public message:string ){
      this.id = AlertMessage.idCounter++ ;
    }

    getNgbType():string {
      switch ( this.type ) {
        case AlertType.INFO:    return 'info' ;
        case AlertType.WARNING: return 'warning' ;
        case AlertType.ERROR:   return 'danger' ;
        case AlertType.SUCCESS: return 'success' ;
      }
      return 'primary' ;
    }
  }

  @Injectable()
  export class AlertService {

    alerts: AlertMessage[] = [] ;

    hasAlerts():boolean {
      return this.alerts.length > 0 ;
    }

    numAlerts():number {
      return this.alerts.length ;
    }

    removeAlert(index:number) {
      this.alerts.splice( index, 1 ) ;
    }

    warn( msg:string ) {
      this.alerts.push( new AlertMessage( AlertType.WARNING, msg ) ) ;
    }

    info( msg:string ) {
      this.alerts.push( new AlertMessage( AlertType.INFO, msg ) )
    }

    error( msg:string ) {
      this.alerts.push( new AlertMessage( AlertType.ERROR, msg ) )
    }

    success( msg:string ) {
      this.alerts.push( new AlertMessage( AlertType.SUCCESS, msg ) )
    }
  }
}
