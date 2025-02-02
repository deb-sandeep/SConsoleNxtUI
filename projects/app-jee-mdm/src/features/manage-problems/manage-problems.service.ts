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
}
