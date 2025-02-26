import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from "lib-core";

import { SessionNetworkService } from "./session-network.service";
import { SessionTypeSO, SyllabusSO, TopicSO, TopicTrackAssignmentSO } from "@jee-common/master-data-types";
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

  async loadMasterData() {

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
      this.sessionTypeSelected( this.sessionTypes[0] ) ;
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
    return this.activeTopicsMap[this.session.syllabus()!.syllabusName]
               .map( obj => obj.topic )
               .includes( topic ) ;
  }

  public sessionTypeSelected( st: SessionTypeSO ) {
    this.session.sessionType = st ;
    this.storageSvc.setItem( StorageKey.LAST_SESSION_TYPE, st.sessionType ) ;
  }

  public syllabusSelected( s: SyllabusSO ) {
    this.session.syllabus.set( s ) ;
    this.session.topic.set( null ) ;
  }

  public async topicSelected( t: TopicSO ) {
    this.session.topic.set( t ) ;
    this.session.sessionId = await this.networkSvc.startNewSession( this.session ) ;
  }
}