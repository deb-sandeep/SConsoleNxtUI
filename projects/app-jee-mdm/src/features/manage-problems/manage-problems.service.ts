import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { ChapterProblemTopicMapping, ProblemTopicMapping, TopicChapterMapping } from "./manage-problems.type";
import { Topic } from "../manage-books/manage-books.type";

@Injectable()
export class ManageProblemsService extends RemoteService {

  getTopicChapterMappings( syllabusName:string ):Promise<TopicChapterMapping[]> {
    const url:string = `${environment.apiRoot}/Master/ChapterTopicMapping?syllabusName=${syllabusName}` ;
    return this.getPromise( url, true ) ;
  }

  swapAttemptSequence( mappingId1:number, mappingId2:number ): Promise<string> {
    const url:string = `${environment.apiRoot}/Master/ChapterTopicMapping/SwapAttemptSequence/${mappingId1}/${mappingId2}` ;
    return this.postPromise( url ) ;
  }

  toggleProblemMapping( mappingId:number ) {
    const url:string = `${environment.apiRoot}/Master/ChapterTopicMapping/ToggleProblemMappingDone/${mappingId}` ;
    return this.postPromise( url ) ;
  }

  getProblemTopicMappingsForChapter( bookId:number, chapterNum:number ):Promise<ChapterProblemTopicMapping> {
    const url:string = `${environment.apiRoot}/Master/ProblemTopicMapping/Book/${bookId}/Chapter/${chapterNum}` ;
    return this.getPromise( url, true ) ;
  }

  getTopic( topicId:number ):Promise<Topic> {
    const url:string = `${environment.apiRoot}/Master/Topic/${topicId}` ;
    return this.getPromise( url, false ) ;
  }

  attachProblems( topicChapterMappingId:number, problems:ProblemTopicMapping[], selTopic:Topic|null ) {
    const url:string = `${environment.apiRoot}/Master/ProblemTopicMapping/AttachProblems/${topicChapterMappingId}` ;

    let problemIds:number[] = problems.map( p => p.problemId ) ;
    this.postPromise<Record<number, number>>( url, problemIds )
        .then( res => {
          problems.forEach( p => {
            p.mappingId = res[p.problemId] ;
            p.topic = selTopic ;
          } )
        } ) ;
  }

  detachProblems( problems:ProblemTopicMapping[] ) {
    const url:string = `${environment.apiRoot}/Master/ProblemTopicMapping/DetachProblems` ;

    let problemIds:number[] = problems.map( p => p.problemId ) ;
    this.postPromise( url, problemIds )
        .then( () => {
          problems.forEach( p => {
            p.mappingId = -1 ;
            p.topic = null ;
          } )
        } ) ;
  }
}
