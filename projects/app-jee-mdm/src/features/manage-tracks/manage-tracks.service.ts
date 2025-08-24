import { inject, Injectable, Signal, signal } from '@angular/core';
import { Alert, PageTitleService, RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SyllabusSO, TopicTrackAssignmentSO, TrackSO } from "@jee-common/util/master-data-types" ;
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

  public selectedSyllabusName = '' ;
  public selectedSyllabus = signal<Syllabus>( this.syllabusMap[this.selectedSyllabusName] ) ;

  private topicScheduleAdjusted = signal<boolean>(false) ;

  public selectedTopicSchedule:TopicSchedule|null = null;

  constructor() {
    super();
  }

  public async refreshInitializationData() {

    try {
      let syllabusSOList = await this.getAllSyllabus() ;
      let trackSOList = await this.getAllTracks() ;
      let topicProblemCounts = await this.getTopicProblemCounts() ;

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

  get topicScheduleUpdated(): Signal<boolean> {
    return this.topicScheduleAdjusted;
  }

  public notifyTopicScheduleUpdated() {
    this.topicScheduleAdjusted.set( !this.topicScheduleAdjusted() ) ;
  }

  public selectDefaultSyllabus() {
    this.setSelectedSyllabusName( Object.keys( this.syllabusMap )[0] ) ;
  }

  public setSelectedSyllabusName( syllabusName : string ) {
    this.selectedSyllabusName = syllabusName ;
    this.titleSvc.setTitle( `Manage Tracks > ${syllabusName}` )
    this.selectedTopicSchedule = null ;
    this.selectedSyllabus.set( this.syllabusMap[this.selectedSyllabusName] ) ;
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

  public async recomputeExerciseDays() {
    for( let track of this.selectedSyllabus()!.tracks ) {
      track.recomputeExerciseDays() ;
      track.recomputeScheduleSequenceAttributes() ;
    }
  }

  public async saveDirtyTracks() {
    for( let track of this.selectedSyllabus()!.tracks ) {
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
