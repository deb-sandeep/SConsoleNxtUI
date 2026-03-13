import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { ExamConfig } from "@jee-common/util/exam-data-types" ;

@Injectable()
export class ExamApiService extends RemoteService {

  constructor() {
    super();
  }

  getListOfExams() {
    const url:string = `${environment.apiRoot}/Master/Exam/` ;
    return this.getPromise<ExamConfig[]>( url ) ;
  }
}