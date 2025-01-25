import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  private titleSubject:BehaviorSubject<string> = new BehaviorSubject<string>( "" ) ;
  title$:Observable<string> = this.titleSubject.asObservable() ;

  setTitle( title:string ) {
    this.titleSubject.next( title ) ;
  }

  clear() {
    this.titleSubject.next("" ) ;
  }
}
