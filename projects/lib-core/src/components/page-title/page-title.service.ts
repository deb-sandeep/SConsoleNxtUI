import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  additionalTitle = signal( "" ) ;

  setTitle( title:string ) {
    this.additionalTitle.set( title ) ;
  }

  clear() {
    this.additionalTitle.set( "" ) ;
  }
}
