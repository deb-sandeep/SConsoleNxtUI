import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { APIResponse } from "../types/api-response" ;
import { ModalWaitService } from "../components/modal-wait/modal-wait.service";

export class RemoteService {

  private static readonly SYSTEM_ERROR_MESSAGE = "System error. Check logs for details." ;

  protected http:HttpClient = inject( HttpClient ) ;
  protected modalWaitSvc:ModalWaitService = inject( ModalWaitService ) ;

  protected postPromise<T>( url:string, body:any={}, modalWait:boolean = false ) : Promise<T> {
    return this.createRequestPromise<T>( () => this.http.post<APIResponse>( url, body ), modalWait ) ;
  }

  protected deletePromise<T>( url:string, modalWait:boolean = false ) : Promise<T> {
    return this.createRequestPromise<T>( () => this.http.delete<APIResponse>( url ), modalWait ) ;
  }

  protected getPromise<T>( url:string, modalWait:boolean = false ) : Promise<T> {
    return this.createRequestPromise<T>( () => this.http.get<APIResponse>( url ), modalWait ) ;
  }

  protected putPromise<T>( url:string, body:any={}, modalWait:boolean = false ) : Promise<T> {
    return this.createRequestPromise<T>( () => this.http.put<APIResponse>( url, body ), modalWait ) ;
  }

  /**
   * Centralizes the common API-response contract used by all remote calls.
   * Each wrapper keeps its original signature while delegating the duplicated
   * subscribe/error/modal-wait behavior here.
   */
  private createRequestPromise<T>( requestFactory:() => Observable<APIResponse>, modalWait:boolean ) : Promise<T> {

    return new Promise<T>( ( resolve, reject ) => {
      this.setModalWaitState( modalWait, true ) ;

      requestFactory()
        .subscribe( {
          next: ( res ) => {
            const wasSuccessful = res.executionResult.status == 'OK' ;

            if( wasSuccessful ) {
              resolve( res.data as T ) ;
            }
            else {
              reject( res.executionResult.message ) ;
            }

            // Keep cleanup after resolve/reject to preserve the existing
            // ordering between promise settlement and wait-dialog dismissal.
            this.setModalWaitState( modalWait, false ) ;
          },
          error: () => {
            reject( RemoteService.SYSTEM_ERROR_MESSAGE ) ;
            this.setModalWaitState( modalWait, false ) ;
          }
        } ) ;
    } ) ;
  }

  private setModalWaitState( modalWaitEnabled:boolean, show:boolean ) : void {
    if( modalWaitEnabled ) {
      this.modalWaitSvc.showWaitDialog = show ;
    }
  }
}
