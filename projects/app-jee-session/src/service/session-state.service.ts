import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from "lib-core";

import { SessionNetworkService } from "./session-network.service";
import {
  SessionPauseSO,
  SessionTypeSO,
  SyllabusSO, TopicProblemSO,
  TopicSO,
  TopicTrackAssignmentSO
} from "@jee-common/master-data-types";
import { StorageKey } from "@jee-common/storage-keys" ;
import dayjs from "dayjs";
import { Session } from "./session";

@Injectable()
export class SessionStateService {

  storageSvc: LocalStorageService = inject( LocalStorageService ) ;
  networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;

  syllabuses: SyllabusSO[] = [];
  sessionTypes: SessionTypeSO[] = [];
  activeTopicsMap: Record<string, { topic:TopicSO, assignment:TopicTrackAssignmentSO, syllabus:SyllabusSO}[]> = {} ;

  session:Session = new Session() ;

  private resetState() {
    this.activeTopicsMap = {} ;
    this.session.topic.set( null ) ;
  }

  async loadMasterData() {

    this.resetState() ;
    this.syllabuses = await this._loadMasterData( () => this.networkSvc.getAllSyllabus(), StorageKey.SYLLABUSES ) ;
    this.sessionTypes = await this._loadMasterData( () => this.networkSvc.getSessionTypes(), StorageKey.SESSION_TYPES ) ;

    let currentAssignments = await this.networkSvc.getCurrentTrackAssignments( this.getCurrentDate() ) ;
    currentAssignments.forEach( assignment => {
      this.addActiveTopic( assignment ) ;
    })

    this.selectLastUsedSessionType() ;
  }

  private addActiveTopic( assignment:TopicTrackAssignmentSO ) {

    this.syllabuses.forEach( syllabus => {
      syllabus.topics.forEach( topic => {
        if( topic.id == assignment.topicId ) {
          let activeTopics = this.activeTopicsMap[ syllabus.syllabusName ] ;
          if( !activeTopics ) {
            activeTopics = [] ;
            this.activeTopicsMap[ syllabus.syllabusName ] = activeTopics ;
          }
          activeTopics.push( {
            topic:topic,
            assignment:assignment,
            syllabus:syllabus
          }) ;
          return ;
        }
      })
    }) ;
  }

  private selectLastUsedSessionType() {
    const lastSessionType = this.storageSvc.getItem( StorageKey.LAST_SESSION_TYPE ) ;
    if( lastSessionType != null ) {
      this.sessionTypes.forEach( st => {
        if( st.sessionType === lastSessionType ) {
          this.session.sessionType = st ;
          return ;
        }
      })
    }
    else {
      this.setSelectedSessionType( this.sessionTypes[0] ) ;
    }
  }

  private async _loadMasterData<T>( networkFn:()=>Promise<T>, storageKey:string )  {

    let obj:T ;
    const str = this.storageSvc.getItem( storageKey ) ;
    if( str == null ) {
      obj = await networkFn() ;
      this.storageSvc.setItem( storageKey, JSON.stringify( obj ) ) ;
    }
    else {
      obj = JSON.parse( str ) ;
    }
    return obj ;
  }

  private getCurrentDate() {
    return dayjs( '2025-04-20' ).toDate() ;
    // return new Date() ;
  }

  public isTopicActive( topic:TopicSO ) {
    let selectedSyllabusName = this.session.syllabus()!.syllabusName ;
    if( selectedSyllabusName in this.activeTopicsMap ) {
      return this.activeTopicsMap[ selectedSyllabusName ]
        .map( obj => obj.topic )
        .includes( topic ) ;
    }
    return false ;
  }

  public setSelectedSessionType( st: SessionTypeSO ) {
    this.session.sessionType = st ;
    this.storageSvc.setItem( StorageKey.LAST_SESSION_TYPE, st.sessionType ) ;
  }

  public setSelectedSyllabus( s: SyllabusSO ) {
    this.session.syllabus.set( s ) ;
    this.session.topic.set( null ) ;
  }

  public async setSelectedTopic( t: TopicSO ) {
    this.session.topic.set( t ) ;
  }

  public async startSession() {
    this.session.startSession() ;
    this.session.sessionId = await this.networkSvc.startSession( this.session ) ;
  }

  public async fetchPigeons() {
    this.session.problems = await this.networkSvc.getPigeonsForSession( this.session ) ;
  }

  public async endSession() {
    this.session.endSession() ;
    await this.networkSvc.extendSession( this.session ) ;
    this.session.sessionId = -1 ;
  }

  public async startPause() {
    let currentTime = new Date() ;
    let pause:SessionPauseSO = {
      id: -1,
      sessionId: this.session.sessionId,
      startTime: currentTime,
      endTime: currentTime
    }
    pause.id = await this.networkSvc.startPause( pause ) ;

    this.session.startPause( pause ) ;
    await this.networkSvc.extendSession( this.session ) ;
  }

  public async endPause() {
    let currentPause = this.session.currentPause ;
    if( currentPause != null ) {

      this.session.endPause() ;
      await this.networkSvc.endPause( currentPause ) ;
      await this.networkSvc.extendSession( this.session ) ;
    }
  }

  public updateContinuationTime( updateServer:boolean) {
    this.session.updateContinuationTime() ;
    if( updateServer ) {
      this.networkSvc.extendSession( this.session ).then() ;
    }
  }

  async setProblemAttempt( problem: TopicProblemSO ) {

    const currentTime = new Date() ;
    let problemAttempt = {
      id: -1,
      sessionId: this.session.sessionId,
      problemId: problem.problemId,
      startTime: currentTime,
      endTime: currentTime,
      effectiveDuration: 0,
      prevState: problem.problemState,
      targetState: problem.problemState,
    } ;
    problemAttempt.id = await this.networkSvc.startProblemAttempt( problemAttempt ) ;
    this.session.startProblemAttempt( problem, problemAttempt ) ;
  }
}