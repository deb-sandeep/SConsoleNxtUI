import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";
import { DEFAULT_SECONDS_PER_QUESTION, ExamSectionTemplate } from "./exam-section.config";

import { environment } from "@env/environment";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { ExamSO, ExamSectionSO } from "@jee-common/util/exam-data-types" ;

interface ExamSetupConfig {
  examType: string;
  selectedSubjects: string[];
  selectedSectionTemplates: ExamSectionTemplate[];
  examSections: ExamSectionSO[];
  examTopics: Record<string, TopicSO[]> ;
  duration : number ;
  notes : string ;
}

export type SaveExamResSO = {
  examId: number,
  errorMsg: string,
}

@Injectable()
export class ExamSetupService extends RemoteService {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  syllabusMap:Record<string, SyllabusSO|undefined> = {} ;

  setupConfig : ExamSetupConfig ;
  currentWizardStep: number = 1 ;
  totalWizardSteps: number = 0 ;

  constructor() {
    super();
    this.resetSectionConfig() ;
    this.fetchSyllabusAndTopics().then() ;
  }

  private async fetchSyllabusAndTopics() {
    let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
    syllabusSOList.forEach( so => {
      this.syllabusMap[so.syllabusName] = so
    } ) ;
  }

  resetSectionConfig() {
    this.currentWizardStep = 1 ;
    this.setupConfig = {
      examType : "MAIN",
      selectedSubjects : [],
      selectedSectionTemplates : [],
      examSections : [],
      examTopics : {},
      duration : 0,
      notes : "",
    }
    this.recomputeTotalWizardSteps() ;
  }

  incrementCurrentWizardStep() {
    this.currentWizardStep += 1;
  }

  recomputeTotalWizardSteps() {
    this.totalWizardSteps =
           1 + // Exam type selection
           1 + // Subjects selection
           1 + // Sections selection
           1 + // Section configuration
           this.setupConfig.selectedSubjects.length + // Topics per subject
           1 ; // Duration and notes
  }

  getRecommendedDuration() {
    let duration = 0 ;
    for( let section of this.setupConfig.examSections ) {
      const lookupTable = DEFAULT_SECONDS_PER_QUESTION[section.syllabusName] ;
      duration += section.numCompulsoryQuestions * lookupTable[section.problemType] ;
    }
    return duration ;
  }

  async saveExamConfig() {
    const url:string = `${environment.apiRoot}/Master/Exam/` ;
    const examConfig : ExamSO = {
      id: -1,
      state: 'DRAFT',
      type: this.setupConfig.examType,
      note: this.setupConfig.notes,
      numPhyQuestions: this.getNumQuestions( 'IIT Physics' ),
      numChemQuestions: this.getNumQuestions( 'IIT Chemistry' ),
      numMathQuestions: this.getNumQuestions( 'IIT Maths' ),
      totalMarks: this.computeTotalMarks(),
      duration: this.setupConfig.duration,
      creationTime: new Date(),
      sections: this.setupConfig.examSections,
      topics: this.setupConfig.examTopics
    }
    console.log( examConfig ) ;
    let result = await this.postPromise<SaveExamResSO>( url, examConfig, true ) ;
    return result.examId ;
  }

  private getNumQuestions( syllabusName : string ){
    let numQuestions = 0 ;
    for( let section of this.setupConfig.examSections ) {
      if( section.syllabusName === syllabusName ){
        numQuestions += section.numCompulsoryQuestions ;
      }
    }
    return numQuestions ;
  }

  private computeTotalMarks() {
    let totalMarks = 0 ;
    for( let section of this.setupConfig.examSections ) {
      totalMarks += section.numCompulsoryQuestions * section.correctMarks ;
    }
    return totalMarks
  }

  getListOfExams() {
    const url:string = `${environment.apiRoot}/Master/Exam/` ;
    return this.getPromise<ExamSO[]>( url ) ;
  }

  deleteExam( id: number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${id}` ;
    return this.deletePromise( url ) ;
  }
}