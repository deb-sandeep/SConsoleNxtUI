import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { APIResponse } from "../types/api-response" ;
import { ModalWaitService } from "../components/modal-wait/modal-wait.service";

export class RemoteService {

  protected http:HttpClient = inject( HttpClient ) ;
  protected modalWaitSvc:ModalWaitService = inject( ModalWaitService ) ;

  protected postPromise<T>( url:string, body:any, modalWait:boolean = false ) : Promise<T> {

    return new Promise<T>( ( resolve, reject ) => {

      if( modalWait ) {
        this.modalWaitSvc.showWaitDialog = true ;
      }

      this.http.post<APIResponse>( url, body )
        .subscribe( {
          next: ( res) => {
            if( res.executionResult.status == 'OK' ) {
              resolve( res.data as T ) ;
              if( modalWait ) {
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }
            else {
              reject( res.executionResult.message ) ;
              if( modalWait ) {
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }
          },
          error: () => {
            reject( "System error. Check logs for details." ) ;
            if( modalWait ) {
              this.modalWaitSvc.showWaitDialog = false ;
            }
          }
        }) ;
    } ) ;
  }

  protected deletePromise<T>( url:string, modalWait:boolean = false ) : Promise<T> {

    return new Promise<T>( ( resolve, reject ) => {

      if( modalWait ) {
        this.modalWaitSvc.showWaitDialog = true ;
      }

      this.http.delete<APIResponse>( url )
          .subscribe( {
            next: ( res) => {
              if( res.executionResult.status == 'OK' ) {
                resolve( res.data as T ) ;
                if( modalWait ) {
                  this.modalWaitSvc.showWaitDialog = false ;
                }
              }
              else {
                reject( res.executionResult.message ) ;
                if( modalWait ) {
                  this.modalWaitSvc.showWaitDialog = false ;
                }
              }
            },
            error: () => {
              reject( "System error. Check logs for details." ) ;
              if( modalWait ) {
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }
          }) ;
    } ) ;
  }

  protected getPromise<T>( url:string, modalWait:boolean = false ) : Promise<T> {

    return new Promise<T>( ( resolve, reject ) => {

      if( modalWait ) {
        this.modalWaitSvc.showWaitDialog = true ;
      }

      this.http.get<APIResponse>( url )
        .subscribe( {
          next: ( res) => {
            if( res.executionResult.status == 'OK' ) {
              resolve( res.data as T ) ;
              if( modalWait ) {
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }
            else {
              reject( res.executionResult.message ) ;
              if( modalWait ) {
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }
          },
          error: () => {
            reject( "System error. Check logs for details." ) ;
            if( modalWait ) {
              this.modalWaitSvc.showWaitDialog = false ;
            }
          }
        }) ;
    } ) ;
  }
}
