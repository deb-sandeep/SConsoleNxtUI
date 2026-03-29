import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  QuestionRepoStatusSO,
} from "./question-repo.type";


@Injectable()
export class QuestionRepoService extends RemoteService {

  getRepoStatus() : Promise<QuestionRepoStatusSO> {
    const url:string = `${environment.apiRoot}/Master/Question/RepoStatus` ;
    return this.getPromise<QuestionRepoStatusSO>( url, true ) ;
  }
}