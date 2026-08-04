import { inject, Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { QuestionSearchResSO } from "./question-browser.type";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";

@Injectable()
export class QuestionBrowserService extends RemoteService {

  static readonly QUESTION_TYPES: string[] = [
    "SCA", "MCA", "LCT", "MMT", "CMT", "ART", "NVT", "IVT"
  ] ;

  static readonly DEFAULT_SORT = [ "serverSyncTime:desc", "problemType:asc" ] ;

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  private syllabusList : SyllabusSO[] = [] ;

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

  // Ticks only on a server-fetched page (fresh search / page nav), not on local edits like a topic change.
  resultsPageLoaded = signal( 0 ) ;

  constructor() {
    super() ;
    this.sylApiSvc.getAllSyllabus().then( list => this.syllabusList = list ) ;
  }

  getTopicsForSyllabus( syllabusName: string ): TopicSO[] {
    return this.syllabusList.find( s => s.syllabusName === syllabusName )?.topics ?? [] ;
  }

  private applyTopicChangeLocally( questionId: number, newTopic: TopicSO ) {
    const results = this.searchResults() ;
    if( !results ) {
      return ;
    }
    const questions = results.questions.map( q =>
        q.id === questionId ? { ...q, topicId: newTopic.id, topicName: newTopic.topicName } : q ) ;
    this.searchResults.set( { ...results, questions } ) ;
  }

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
            this.resultsPageLoaded.update( v => v + 1 ) ;
    });
  }

  async updateQuestionTopic( question: QuestionSO, newTopic: TopicSO ): Promise<void> {
    const url: string = `${ environment.apiRoot }/Master/Question/Topic/${ question.id }/${ newTopic.id }`;
    await this.postPromise<void>( url, {}, true );
    return this.applyTopicChangeLocally( question.id, newTopic );
  }
}