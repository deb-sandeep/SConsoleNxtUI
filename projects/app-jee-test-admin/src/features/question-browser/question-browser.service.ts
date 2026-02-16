import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { QuestionSearchResSO } from "./question-browser.type";

@Injectable()
export class QuestionBrowserService extends RemoteService {

  private searchCriteria : {
    topicIds : number[],
    page : number,
    size : number,
    sort : string[]
  }   = {
    "topicIds" : [],
    "page" : 0,
    "size" : 25,
    "sort" : ["problemType,asc"]
  }

  searchResults = signal<QuestionSearchResSO|null>(null) ;

  updatePageSize( pageSize: number ) {
    this.searchCriteria.size = pageSize ;
  }

  initiateFreshSearch( topicIds : number[] ) {
    this.searchCriteria.topicIds = topicIds ;
    this.searchCriteria.page = 0 ;
    this.searchCriteria.sort = [ "problemType,asc" ] ;
    this.fetchSearchResults() ;
  }

  fetchResultsPage( pageNumber: number ) {
    this.searchCriteria.page = pageNumber ;
    this.fetchSearchResults() ;
  }

  private fetchSearchResults() {
    const url:string = `${environment.apiRoot}/Master/Question/Search` ;
    this.postPromise<QuestionSearchResSO>( url, this.searchCriteria, true )
        .then( results => {
            console.log( results ) ;
            this.searchResults.set( results ) ;
    });
  }
}