import { inject, Injectable } from "@angular/core";
import { Alert, RemoteService } from "lib-core";
import { ProblemAttemptSO, SyllabusSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { environment } from "@env/environment";

import AlertService = Alert.AlertService;
import { Syllabus } from "./entities/syllabus";

@Injectable()
export class ProblemHistoryService extends RemoteService {

  private alertSvc:AlertService = inject( AlertService ) ;

  public syllabusMap:Record<string, Syllabus> = {} ;

  constructor() {
    super();
    this.fetchSyllabusAndTopics().then() ;
  }

  public async fetchSyllabusAndTopics() {

    try {
      let syllabusSOList = await this.getAllSyllabus() ;

      syllabusSOList.forEach( so => {
        this.syllabusMap[so.syllabusName] = new Syllabus( so )
      } ) ;
    }
    catch( error ) { this.alertSvc.error( 'Error : ' + error ) ; }
  }


  // ---------- Server communication methods ------------------------------------------
  public getAllSyllabus():Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, true ) ;
  }

  public getProblems( topicId:number ): Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Master/Topic/${topicId}/Problems` ;
    return this.getPromise( url, true ) ;
  }

  public getProblemAttempts( problemId: number ):Promise<ProblemAttemptSO[]> {
    const url:string = `${environment.apiRoot}/Problem/${problemId}/Attempts` ;
    return this.getPromise( url, false ) ;
  }

  updateProblemDifficultyLevel( problemId: number, difficultyLevel: number ) {
    const url:string = `${environment.apiRoot}/Master/Problem/${problemId}/DifficultyLevel/${difficultyLevel}` ;
    return this.postPromise<void>( url ) ;
  }

  changePigeonState( problemId: number, topicId:number,
    currentState: string,
    targetState: string ) {
    const url:string = `${environment.apiRoot}/Problem/Pigeon/ChangeState` ;
    return this.postPromise( url, {
      problemId: problemId,
      topicId: topicId,
      currentState: currentState,
      targetState: targetState
    }) ;
  }
}