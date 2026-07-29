import { Injectable } from '@angular/core';
import { JeeBaseService } from "@jee-common/services/jee-base.service";

@Injectable()
export class JeeAdvancedService extends JeeBaseService {

  async loadExamConfig( examId: number ) {
    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;
    this.timeLeftInSeconds.set( this.examConfig.duration ) ;
  }
}
