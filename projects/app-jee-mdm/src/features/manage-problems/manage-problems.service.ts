import { Injectable } from '@angular/core';
import { APIResponse, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { TopicChapterMapping } from "./manage-problems.type";

import { topicChapterListTestdata } from "./test-data/topic-chapter-list.testdata";

@Injectable()
export class ManageProblemsService extends RemoteService {

  getTopicChapterMappings( syllabusName:string ):Promise<TopicChapterMapping[]> {
    return new Promise<TopicChapterMapping[]>( (resolve, reject) => {
      resolve( topicChapterListTestdata ) ;
    }) ;
  }
}
