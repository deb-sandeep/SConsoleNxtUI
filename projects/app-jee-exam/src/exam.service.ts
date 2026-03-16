import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { ExamConfig } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "./exam-api.service";

@Injectable()
export class ExamService {

  private apiSvc = inject( ExamApiService ) ;

  examConfig: ExamConfig ;

  constructor() {
  }

  async loadExamConfig( examId: number ) {
    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;
    console.log( this.examConfig ) ;
  }
}