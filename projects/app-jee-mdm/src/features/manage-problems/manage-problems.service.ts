import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { TopicChapterMapping } from "./manage-problems.type";

@Injectable()
export class ManageProblemsService extends RemoteService {

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
}
