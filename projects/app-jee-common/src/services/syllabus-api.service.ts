import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { SyllabusSO } from "@jee-common/util/master-data-types";
import { environment } from "@env/environment";

@Injectable()
export class SyllabusApiService extends RemoteService {

  constructor() {
    super();
  }

  public getAllSyllabus():Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, true ) ;
  }
}