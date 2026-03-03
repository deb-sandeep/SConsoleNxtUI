import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { ExamConfig, ExamSectionConfig, QuestionSO } from "../../type";

@Injectable()
export class ExamEditService extends RemoteService {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  syllabusMap:Record<string, SyllabusSO|undefined> = {} ;
  examCfg : ExamConfig|null = null ;
  topicMap : Record<string, TopicSO[]> = {} ;
  sectionMap : Record<string, ExamSectionConfig[]> = {};
  problemTypes : string[] = [] ;
  selTopicQuestions : Record<string, QuestionSO[]> = {} ;

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

  private resetState() {
    this.syllabusMap = {} ;
    this.examCfg = null ;
    this.topicMap = {};
    this.sectionMap = {};
    this.problemTypes = [];
    this.selTopicQuestions = {} ;
  }

  async fetchExamDetails( examId : number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${examId}` ;
    await this.getPromise<ExamConfig>( url ).then( exam => {

      this.resetState() ;
      this.examCfg = exam ;
      this.topicMap = exam.topics ;

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

  async fetchAvailableQuestions( topic: TopicSO | null ) {
    if( topic == null ) {
      this.selTopicQuestions = {} ;
    }
    else {
      const url:string = `${environment.apiRoot}/Master/Question/AvailableQuestions?topicId=${topic.id}&problemTypes=${this.problemTypes}` ;
      await this.getPromise<{
        topicId:number,
        questions:Record<string, QuestionSO[]>
      }>( url ).then( res => {
          console.log( res ) ;
          this.selTopicQuestions = res.questions ;
      }) ;
    }
  }
}