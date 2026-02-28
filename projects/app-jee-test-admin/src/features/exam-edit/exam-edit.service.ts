import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { ExamConfig, ExamSectionConfig } from "../../type";

@Injectable()
export class ExamEditService extends RemoteService {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  syllabusMap:Record<string, SyllabusSO|undefined> = {} ;
  examCfg : ExamConfig|null = null ;
  topicMap : Record<string, TopicSO[]> = {} ;
  sectionMap : Record<string, ExamSectionConfig[]> = {};
  problemTypes : string[] = [] ;

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
    await this.getPromise<ExamConfig>( url ).then( exam => {
      this.examCfg = exam ;
      this.topicMap = exam.topics ;
      this.sectionMap = {} ;
      this.problemTypes = [] ;

      exam.sections.forEach( section => {
        if( !this.sectionMap[section.syllabusName] ) {
          this.sectionMap[section.syllabusName] = [];
        }
        this.sectionMap[section.syllabusName].push( section );
      } ) ;

      // Extract problem types
      for( let section of this.sectionMap[exam.sections[0].syllabusName] ) {
        this.problemTypes.push( section.problemType ) ;
      }

      console.log( "Exam config" ) ;
      console.log( this.examCfg ) ;
    }) ;
  }
}