import { inject, Injectable } from "@angular/core";
import { Alert, RemoteService } from "lib-core";
import { SyllabusSO, TopicProblemSO } from "@jee-common/master-data-types";
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
}