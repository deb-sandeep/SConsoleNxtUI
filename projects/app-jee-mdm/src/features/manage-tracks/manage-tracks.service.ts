import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Alert, PageTitleService, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { SyllabusSO, TopicTrackAssignmentSO, TrackSO } from "../../server-object-types" ;
import { TopicProblemCounts } from "./manage-tracks.types";

import AlertService = Alert.AlertService;
import { Syllabus } from "./entities/syllabus";
import { TopicSchedule } from "./entities/topic-schedule";
import { Track } from "./entities/track";

@Injectable()
export class ManageTracksService extends RemoteService {

  private titleSvc:PageTitleService = inject( PageTitleService ) ;
  private alertSvc:AlertService = inject( AlertService ) ;

  public syllabusMap:Record<string, Syllabus> = {} ;

  public selectedSyllabusName = signal('') ;
  public selectedSyllabus = computed<Syllabus>( () => this.syllabusMap[this.selectedSyllabusName()] ) ;

  public selectedTopicSchedule:TopicSchedule|null = null;

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
        this.syllabusMap[so.syllabusName] = new Syllabus( so, this )
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
    this.selectedTopicSchedule = null ;
  }

  public setSelectedTopicSchedule( ts: TopicSchedule|null ) {
    this.selectedTopicSchedule = ts ;
    Object.values( this.syllabusMap ).forEach( s => {
      s.tracks.forEach( track => {
        for( let schedule of track ) {
          schedule.selected = schedule == ts ;
        }
      })
    }) ;
  }

  public async saveDirtyTracks() {
    for( let track of this.selectedSyllabus().tracks ) {
      if( track.isDirty() ) {
        const schedules:TopicTrackAssignmentSO[] = await this.saveTopicSchedules( track ) ;
        track.refreshSavedState( schedules ) ;
      }
    }
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

  private saveTopicSchedules( track: Track ):Promise<TopicTrackAssignmentSO[]> {
    const url:string = `${environment.apiRoot}/Master/Track/${track.id}/SaveTopicSchedules` ;
    const schedules:TopicTrackAssignmentSO[] = track.getTopicTrackAssignmentSOs() ;
    return this.postPromise( url, schedules ) ;
  }

  // ----------------------------------------------------------------------------------
}
