import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { APIResponse } from "lib-core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../../environments/environment";
import { BookValidationResult, SaveBookMetaRes } from "./manage-books.type";
import { testResponse } from "./components/book-upload-review/test-validation-response" ;

@Injectable()
export class ManageBooksService {

  private validationResultSubject:BehaviorSubject<BookValidationResult|null> = new BehaviorSubject<BookValidationResult|null>( null ) ;
  validationResult$ = this.validationResultSubject.asObservable() ;

  constructor( private http:HttpClient ) {
      this.validationResultSubject.next( testResponse.data ) ;
  }

  validateFileOnServer( file:File ) : Promise<void> {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const formData = new FormData() ;
    formData.append( 'file', file ) ;

    return new Promise( ( resolve, reject ) => {
      this.http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              console.log( 'File successfully validated. Validation results:' ) ;
              console.log( res ) ;
              this.validationResultSubject.next( res.data ) ;
              resolve() ;
            },
            error: () => {
              this.validationResultSubject.next( null ) ;
              reject() ;
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
        this.http.post<APIResponse>( saveUrl, {
          "uploadedFileName": serverFileName
        }).subscribe( {
          next: ( res) => {
            console.log( 'saveBook returned normally. Response:' ) ;
            if( res.executionResult.status == 'OK' ) {
              let status:SaveBookMetaRes = res.data ;
              let statusMsg = `
              Created ${status.numChaptersCreated} chapters, 
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
        } ) ;
      }
    } ) ;
  }
}
