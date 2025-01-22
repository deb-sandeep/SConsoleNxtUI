import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { APIResponse, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { BookProblemSummary, BookSummary, BookValidationResult, SaveBookMetaRes } from "./manage-books.type";


@Injectable()
export class ManageBooksService extends RemoteService {

  private validationResultSub:BehaviorSubject<BookValidationResult|null> = new BehaviorSubject<BookValidationResult|null>( null ) ;
  validationResult$ = this.validationResultSub.asObservable() ;

  getBookListing() : Promise<BookSummary[]> {

    const url:string = `${environment.apiRoot}/Master/Book/Listing` ;
    return this.getPromise<BookSummary[]>( url, true ) ;
  }

  getBookProblemSummary( bookId:number ) : Promise<BookProblemSummary> {

    const url:string = `${environment.apiRoot}/Master/Book/${bookId}/ProblemSummary` ;
    return this.getPromise( url, true ) ;
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
            error: () => {
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

        this.modalWaitSvc.showWaitDialog = true ;
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
                this.modalWaitSvc.showWaitDialog = false ;
              },
              error: () => {
                reject( "System error saving book. Check logs for details." ) ;
                this.modalWaitSvc.showWaitDialog = false ;
              }
            }) ;
      }
    } ) ;
  }

  updateBookAttribute( book:BookSummary, attribute:string, value:string ) : Promise<string> {

    const url = `${environment.apiRoot}/Master/Book/${book.id}/UpdateAttribute` ;
    return this.postPromise<string>( url, {
      "attribute": attribute,
      "value": value
    }) ;
  }

  updateChapterName( bookId:number, chapterNum:number, name:string ) : Promise<string> {

    const url = `${environment.apiRoot}/Master/Book/${bookId}/${chapterNum}/UpdateChapterName` ;
    return this.postPromise<string>( url, {"value": name}) ;
  }

  updateExerciseName( bookId:number, chapterNum:number, exerciseNum:number, name:string ) : Promise<string> {

    const url = `${environment.apiRoot}/Master/Book/${bookId}/${chapterNum}/${exerciseNum}/UpdateExerciseName` ;
    return this.postPromise<string>( url, {"value": name}) ;
  }
}
