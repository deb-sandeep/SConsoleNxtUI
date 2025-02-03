import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { ChapterProblemTopicMapping, TopicChapterMapping } from "./manage-problems.type";

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

  getChapterProblemTopicMappings( bookId:number, chapterNum:number, selTopicId:number ):Promise<ChapterProblemTopicMapping> {
    const url:string = `${environment.apiRoot}/Master/ProblemTopicMapping/${bookId}/${chapterNum}/${selTopicId}` ;
    return this.getPromise( url, true ) ;
  }
}
