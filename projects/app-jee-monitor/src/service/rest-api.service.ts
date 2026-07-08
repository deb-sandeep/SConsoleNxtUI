import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  SessionTypeSO,
  SyllabusSO,
} from "@jee-common/util/master-data-types";
import { BurnChartVO } from "./response-payload.types";

@Injectable()
export class RestApiService extends RemoteService {

  getAllSyllabus() : Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise<SyllabusSO[]>( url, true ) ;
  }

  getSessionTypes() : Promise<SessionTypeSO[]> {
    const url:string = `${environment.apiRoot}/Session/Types` ;
    return this.getPromise<SessionTypeSO[]>( url, true ) ;
  }

  getBurnChart( topicId: number ) : Promise<BurnChartVO> {
    const url:string = `${environment.apiRoot}/Topic/${topicId}/burnChart` ;
    return this.getPromise<BurnChartVO>( url ) ;
  }
}