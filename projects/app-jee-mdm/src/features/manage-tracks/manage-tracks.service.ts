import { effect, inject, Injectable, signal } from '@angular/core';
import { PageTitleService, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { Syllabus, Topic, Track } from "../../base-types" ;

@Injectable()
export class ManageTracksService extends RemoteService {

  public syllabusList:Syllabus[] = [] ;
  public trackList:Track[] = [] ;
  public syllabusTopics:Record<string, Topic[]> = {} ;
  public syllabusTracks:Record<string, Track[]> = {} ;

  private titleSvc:PageTitleService = inject(PageTitleService) ;

  public selectedSyllabus = signal('') ;

  constructor() {
    super();
    effect( () => this.syllabusSelectionChanged( this.selectedSyllabus() ) ) ;
  }

  public postProcessInitializationData() {
    this.selectedSyllabus.set( this.syllabusList[0]?.syllabusName ) ;
    this.syllabusList.forEach( syllabus => this.syllabusTopics[ syllabus.syllabusName ] = syllabus.topics ) ;
    this.trackList.forEach( track => {
      if( !(track.syllabusName in this.syllabusTracks) ) {
        this.syllabusTracks[track.syllabusName] = [] ;
      }
      this.syllabusTracks[track.syllabusName].push(track) ;
    }) ;
  }

  private syllabusSelectionChanged( selectedSyllabusName:string ) {
    this.titleSvc.setTitle( `Manage Tracks > ${selectedSyllabusName}` )
  }

  public getAllSyllabus():Promise<Syllabus[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, true ) ;
  }

  public getAllTracks():Promise<Track[]> {
    const url:string = `${environment.apiRoot}/Master/Track/All` ;
    return this.getPromise( url, true ) ;
  }
}
