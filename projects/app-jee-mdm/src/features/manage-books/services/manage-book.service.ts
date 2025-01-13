import { Injectable } from '@angular/core';
import { APIResponse } from "lib-core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";

@Injectable()
export class ManageBookService {

  constructor( private http:HttpClient ) { }

  uploadFileForVerification( file:File ) : Promise<void> {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const formData = new FormData() ;
    formData.append( 'file', file ) ;

    return new Promise( ( resolve, reject ) => {
      this.http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              console.log( 'File successfully uploaded.' ) ;
              console.log( res ) ;
              resolve() ;
            },
            error: () => {
              reject() ;
            }
          } ) ;
    } ) ;
  }
}
