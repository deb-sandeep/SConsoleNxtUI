import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { QuestionSearchResSO } from "./question-browser.type";

@Injectable()
export class QuestionBrowserService extends RemoteService {

  static readonly QUESTION_TYPES: string[] = [
    "SCA", "MCA", "LCT", "MMT", "CMT", "ART", "NVT"
  ] ;

  static readonly DEFAULT_SORT = [ "serverSyncTime:desc", "problemType:asc" ] ;

  private searchCriteria : {
    topicIds : number[],
    qTypes : string[],
    page : number,
    size : number,
    sort : string[]
  } = {
    "topicIds" : [],
    "qTypes" : [],
    "page" : 0,
    "size" : 25,
    "sort" : QuestionBrowserService.DEFAULT_SORT
  }

  searchResults = signal<QuestionSearchResSO|null>(null) ;

  updatePageSize( pageSize: number ) {
    this.searchCriteria.size = pageSize ;
  }

  initiateFreshSearch( topicIds : number[], qTypes: string[] ) {
    this.searchCriteria.topicIds = topicIds ;
    this.searchCriteria.qTypes = qTypes ;
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