import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { APIResponse } from "lib-core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../../environments/environment";
import { BookValidationResult, SaveBookMetaRes } from "./manage-books.type";

@Injectable()
export class ManageBooksService {

  private validationResultSub:BehaviorSubject<BookValidationResult|null> = new BehaviorSubject<BookValidationResult|null>( null ) ;
  validationResult$ = this.validationResultSub.asObservable() ;

  constructor( private http:HttpClient ) {}

  validateFileOnServer( file:File ) : Promise<void> {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const formData = new FormData() ;
    formData.append( 'file', file ) ;

    return new Promise( ( resolve, reject ) => {
      this.http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              this.validationResultSub.next( res.data ) ;
              resolve() ;
            },
            error: () => {
              this.validationResultSub.next( null ) ;
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
}
