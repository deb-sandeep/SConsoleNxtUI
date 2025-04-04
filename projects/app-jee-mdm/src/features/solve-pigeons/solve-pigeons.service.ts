import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { ProblemAttemptSO, SyllabusSO, TopicProblemSO } from "@jee-common/master-data-types";
import { environment } from "@env/environment";

@Injectable()
export class SolvePigeonsService extends RemoteService {

  // ---------- Server communication methods ------------------------------------------

  public getAllPigeons():Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Problem/Pigeons` ;
    return this.getPromise( url, true ) ;
  }

  public getAllSyllabus():Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, false ) ;
  }
  
  public getProblemAttempts( problemId: number ):Promise<ProblemAttemptSO[]> {
    const url:string = `${environment.apiRoot}/Problem/${problemId}/Attempts` ;
    return this.getPromise( url, false ) ;
  }

  public changePigeonState( problemId: number, topicId:number,
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

  updateProblemDifficultyLevel( problemId: number, difficultyLevel: number ) {
    const url:string = `${environment.apiRoot}/Master/Problem/${problemId}/DifficultyLevel/${difficultyLevel}` ;
    return this.postPromise<void>( url ) ;
  }
}