import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { APIResponse, ModalWaitService } from "lib-core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../../environments/environment";
import {BookSummary, BookValidationResult, SaveBookMetaRes} from "./manage-books.type";

@Injectable()
export class ManageBooksService {

  private validationResultSub:BehaviorSubject<BookValidationResult|null> = new BehaviorSubject<BookValidationResult|null>( null ) ;
  validationResult$ = this.validationResultSub.asObservable() ;

  constructor( private http:HttpClient,
               private modalWaitSvc:ModalWaitService ) {}

  getBookListing() : Promise<BookSummary[]> {

    const url:string = `${environment.apiRoot}/Master/Book/Listing` ;
    return new Promise( ( resolve, reject ) => {
      this.http.get<APIResponse>( url )
        .subscribe( {
          next: res => {
            resolve( res.data ) ;
          },
          error: () => {
            reject( null ) ;
          }
        } ) ;
    } ) ;
  }

  validateFileOnServer( file:File ) : Promise<string> {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const formData = new FormData() ;
    formData.append( 'file', file ) ;

    this.validationResultSub.next( null ) ;

    return new Promise( ( resolve, reject ) => {
      this.modalWaitSvc.showWaitDialog = true ;
      this.http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              this.validationResultSub.next( res.data ) ;
              if( res.executionResult.status == 'OK' ) {
                resolve( "Book uploaded successfully." ) ;
              }
              else {
                reject( res.executionResult.message ) ;
              }
              this.modalWaitSvc.showWaitDialog = false ;
            },
            error: ( err ) => {
              this.validationResultSub.next( null ) ;
              reject( "Server error." ) ;
              this.modalWaitSvc.showWaitDialog = false ;
            }
          } ) ;
    } ) ;
  }

  saveBook( serverFileName:string | undefined ) : Promise<string> {

    const saveUrl = `${environment.apiRoot}/Master/Book/SaveMeta` ;

    return new Promise( ( resolve, reject ) => {

      if( serverFileName == undefined ) {
        reject( "No server file name provided" ) ;
      }
      else {

        const postBody = {
          "uploadedFileName": serverFileName
        }

        this.http.post<APIResponse>( saveUrl, postBody )
            .subscribe( {
              next: ( res) => {

                if( res.executionResult.status == 'OK' ) {
                  let status:SaveBookMetaRes = res.data ;
                  let statusMsg = `Created ${status.numChaptersCreated} chapters, 
                                          ${status.numExercisesCreated} exercises and 
                                          ${status.numProblemsCreated} problems.` ;

                  resolve(`Book uploaded successfully. ${statusMsg}` ) ;
                }
                else {
                  reject( "Error saving book: " + res.executionResult.message ) ;
                }
              },
              error: () => {
                reject( "System error saving book. Check logs for details." ) ;
              }
            }) ;
      }
    } ) ;
  }

  updateBookAttribute( book:BookSummary, attribute:string, value:string ) : Promise<string> {

    const url = `${environment.apiRoot}/Master/Book/UpdateAttribute` ;

    return new Promise( ( resolve, reject ) => {

      const postBody = {
        "id": book.id,
        "attribute": attribute,
        "value": value
      } ;

      this.http.post<APIResponse>( url, postBody )
        .subscribe( {
          next: ( res) => {
            if( res.executionResult.status == 'OK' ) {
              resolve( 'Updated successfully' ) ;
            }
            else {
              reject( "Error updating attribute: " + res.executionResult.message ) ;
            }
          },
          error: () => {
            reject( "System error. Check logs for details." ) ;
          }
        }) ;
    } ) ;
  }
}
