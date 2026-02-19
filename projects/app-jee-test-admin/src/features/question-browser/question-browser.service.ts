import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { QuestionSearchResSO } from "./question-browser.type";

@Injectable()
export class QuestionBrowserService extends RemoteService {

  static readonly DEFAULT_SORT = [ "serverSyncTime:desc", "problemType:asc" ] ;

  private searchCriteria : {
    topicIds : number[],
    page : number,
    size : number,
    sort : string[]
  }   = {
    "topicIds" : [],
    "page" : 0,
    "size" : 25,
    "sort" : QuestionBrowserService.DEFAULT_SORT
  }

  searchResults = signal<QuestionSearchResSO|null>(null) ;

  updatePageSize( pageSize: number ) {
    this.searchCriteria.size = pageSize ;
  }

  initiateFreshSearch( topicIds : number[] ) {
    this.searchCriteria.topicIds = topicIds ;
    this.searchCriteria.page = 0 ;
    this.searchCriteria.sort = QuestionBrowserService.DEFAULT_SORT ;
    this.fetchSearchResults() ;
  }

  fetchResultsPage( pageNumber: number ) {
    this.searchCriteria.page = pageNumber ;
    this.fetchSearchResults() ;
  }

  clearSearchResults(){
    this.searchResults.set( null ) ;
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