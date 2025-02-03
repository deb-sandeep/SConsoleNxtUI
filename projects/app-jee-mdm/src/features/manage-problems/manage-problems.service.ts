import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { ChapterProblemTopicMapping, SelectedTopic, TopicChapterMapping } from "./manage-problems.type";

@Injectable()
export class ManageProblemsService extends RemoteService {

  // This is set when the user selects a particular chapter for problem mapping to the
  // topic that the chapter has been mapped to. This is used in the topic chapter problem list component
  selectedTopic:SelectedTopic | null = null ;

  getTopicChapterMappings( syllabusName:string ):Promise<TopicChapterMapping[]> {
    const url:string = `${environment.apiRoot}/Master/Topic/ChapterMappings?syllabusName=${syllabusName}` ;
    return this.getPromise( url, true ) ;
  }

  swapAttemptSequence( mappingId1:number, mappingId2:number ): Promise<string> {
    const url:string = `${environment.apiRoot}/Master/Topic/ChapterMapping/SwapAttemptSequence/${mappingId1}/${mappingId2}` ;
    return this.postPromise( url ) ;
  }

  toggleProblemMapping( mappingId:number ) {
    const url:string = `${environment.apiRoot}/Master/Topic/ChapterMapping/${mappingId}/ToggleProblemMappingDone` ;
    return this.postPromise( url ) ;
  }

  getChapterProblemTopicMappings( bookId:number, chapterNum:number ):Promise<ChapterProblemTopicMapping> {
    const url:string = `${environment.apiRoot}/Master/ProblemTopicMapping/${bookId}/${chapterNum}` ;
    return this.getPromise( url, true ) ;
  }
}
