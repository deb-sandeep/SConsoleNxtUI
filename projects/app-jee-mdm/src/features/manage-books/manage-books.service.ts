import { Injectable, signal } from '@angular/core';
import { APIResponse, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import {
  BookProblemSummary,
  BookSummary,
  BookTopicMappingRes,
  BookValidationResult,
  SaveBookMetaRes
} from "./manage-books.type";


@Injectable()
export class ManageBooksService extends RemoteService {

  validationResult = signal<BookValidationResult|null>(null) ;

  selectedBooks:BookSummary[] = [] ;

  getBookListing() : Promise<BookSummary[]> {
    const url:string = `${environment.apiRoot}/Master/Book/Listing` ;
    return this.getPromise<BookSummary[]>( url, true ) ;
  }

  getBookProblemSummary( bookId:number ) : Promise<BookProblemSummary> {

    const url:string = `${environment.apiRoot}/Master/Book/${bookId}/ProblemSummary` ;
    return this.getPromise( url, true ) ;
  }

  getBookTopicMappings() : Promise<BookTopicMappingRes> {
    // The selectedBooks is set into the service by the book listing component before
    // being routed to the topic mapping component.
    let bookIds = this.selectedBooks.map( b => b.id ) ;
    const url:string = `${environment.apiRoot}/Master/Book/TopicMappings?bookIds=${bookIds}` ;
    return this.getPromise( url, true ) ;
  }

  validateFileOnServer( file:File ) : Promise<string> {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const formData = new FormData() ;
    formData.append( 'file', file ) ;

    return new Promise( ( resolve, reject ) => {
      this.modalWaitSvc.showWaitDialog = true ;
      this.http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              this.validationResult.set( res.data ) ;
              if( res.executionResult.status == 'OK' ) {
                resolve( "Book uploaded successfully." ) ;
              }
              else {
                reject( res.executionResult.message ) ;
              }
              this.modalWaitSvc.showWaitDialog = false ;
            },
            error: () => {
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

  createChapterTopicMapping( bookId:number, chapterNum:number, topicId:number ) : Promise<number> {

    const url = `${environment.apiRoot}/Master/ChapterTopicMapping` ;
    return this.postPromise<number>( url, {
      "bookId" : bookId,
      "chapterNum" : chapterNum,
      "topicId" : topicId
    }, true ) ;
  }

  deleteChapterTopicMapping( mappingId:number ) : Promise<void> {

    const url = `${environment.apiRoot}/Master/ChapterTopicMapping/${mappingId}` ;
    return this.deletePromise( url, false ) ;
  }
}