import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { APIResponse } from "lib-core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../../../environments/environment";
import { BookValidationResult } from "../types/book-validation-result.type";
import { testResponse } from "../test-data/test-validation-response" ;

@Injectable()
export class ManageBookService {

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
}
