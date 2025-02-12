import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Alert, PageTitleService, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { SyllabusSO, TrackSO } from "../../server-object-types" ;
import { TopicProblemCounts } from "./manage-tracks.types";

import AlertService = Alert.AlertService;
import { Syllabus } from "./entities/syllabus";

@Injectable()
export class ManageTracksService extends RemoteService {

  private titleSvc:PageTitleService = inject( PageTitleService ) ;
  private alertSvc:AlertService = inject( AlertService ) ;

  public syllabusMap:Record<string, Syllabus> = {} ;

  public selectedSyllabusName = signal('') ;
  public selectedSyllabus = computed<Syllabus>( () => this.syllabusMap[this.selectedSyllabusName()] ) ;

  constructor() {
    super();
    effect( () => this.syllabusSelectionChanged( this.selectedSyllabusName() ) ) ;
  }

  public async fetchInitializationData() {

    try {
      let syllabusSOList = await this.getAllSyllabus() ;
      let trackSOList = await this.getAllTracks() ;
      let topicProblemCounts = await this.getTopicProblemCounts() ;

      this.selectedSyllabusName.set( syllabusSOList[0]?.syllabusName ) ;

      syllabusSOList.forEach( so => {
        this.syllabusMap[so.syllabusName] = new Syllabus( so )
      } ) ;

      trackSOList.forEach( tso => {
        this.syllabusMap[ tso.syllabusName ].addTrack( tso ) ;
      })

      topicProblemCounts.forEach( tpc => {
        for( let syllabus of Object.values( this.syllabusMap ) ) {
          if( tpc.topicId in syllabus.topicMap ) {
            syllabus.topicMap[tpc.topicId].problemCounts = tpc ;
          }
        }
      }) ;
    }
    catch (error) { this.alertSvc.error( 'Error : ' + error ) ; }
  }

  private syllabusSelectionChanged( selectedSyllabusName:string ) {
    this.titleSvc.setTitle( `Manage Tracks > ${selectedSyllabusName}` )
  }

  // ---------- Server communication methods ------------------------------------------

  public getAllSyllabus():Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise( url, true ) ;
  }

  public getAllTracks():Promise<TrackSO[]> {
    const url:string = `${environment.apiRoot}/Master/Track/All` ;
    return this.getPromise( url, true ) ;
  }

  public getTopicProblemCounts():Promise<TopicProblemCounts[]> {
    const url:string = `${environment.apiRoot}/Master/Topic/ProblemTypeCounts` ;
    return this.getPromise( url, true ) ;
  }

  // ----------------------------------------------------------------------------------
}
