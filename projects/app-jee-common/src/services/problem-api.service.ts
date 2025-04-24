import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { ProblemAttemptSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { environment } from "@env/environment";

@Injectable()
export class ProblemApiService extends RemoteService {

  constructor() {
    super();
  }

  public getProblems( topicId:number ): Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Master/Topic/${topicId}/Problems` ;
    return this.getPromise( url, true ) ;
  }

  public getProblem( problemId:number ): Promise<TopicProblemSO> {
    const url:string = `${environment.apiRoot}/Problem/${problemId}` ;
    return this.getPromise( url, false ) ;
  }

  public getProblemAttempts( problemId: number ):Promise<ProblemAttemptSO[]> {
    const url:string = `${environment.apiRoot}/Problem/${problemId}/Attempts` ;
    return this.getPromise( url, false ) ;
  }

  public deleteProblemAttempt( problemAttemptId: number ) {
    const url:string = `${environment.apiRoot}/Problem/Attempt/${problemAttemptId}` ;
    return this.deletePromise( url, false ) ;
  }

  public updateProblemDifficultyLevel( problemId: number, difficultyLevel: number ) {
    const url:string = `${environment.apiRoot}/Master/Problem/${problemId}/DifficultyLevel/${difficultyLevel}` ;
    return this.postPromise<void>( url ) ;
  }

  public changeProblemState( problemIds: number[], topicId:number, targetState: string ) {
    const url:string = `${environment.apiRoot}/Problem/ChangeState` ;
    return this.postPromise( url, {
      problemIds: problemIds,
      topicId: topicId,
      targetState: targetState
    }) ;
  }

  public getAllPigeons():Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Problem/Pigeons` ;
    return this.getPromise( url, true ) ;
  }

}