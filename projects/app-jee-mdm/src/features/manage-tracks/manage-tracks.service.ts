import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { Syllabus } from "../../base-types" ;
import { Track } from "./manage-tracks.types";

@Injectable()
export class ManageTracksService extends RemoteService {

  getAllSyllabus():Promise<Syllabus[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, true ) ;
  }

  getAllTracks():Promise<Track[]> {
    const url:string = `${environment.apiRoot}/Master/Track/All` ;
    return this.getPromise( url, true ) ;
  }
}
