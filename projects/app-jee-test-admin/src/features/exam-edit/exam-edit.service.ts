import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { ExamConfig } from "../../type";

@Injectable()
export class ExamEditService extends RemoteService {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  syllabusMap:Record<string, SyllabusSO|undefined> = {} ;

  constructor() {
    super();
    this.fetchSyllabusAndTopics().then() ;
  }

  private async fetchSyllabusAndTopics() {
    let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
    syllabusSOList.forEach( so => {
      this.syllabusMap[so.syllabusName] = so
    } ) ;
  }

  async fetchExamDetails( examId : number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${examId}` ;
    return await this.getPromise<ExamConfig>( url ) ;
  }
}