import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from "lib-core";

import { SessionNetworkService } from "./session-network.service";
import {
  SessionTypeSO,
  SyllabusSO, TopicSO,
  TopicTrackAssignmentSO
} from "@jee-common/master-data-types";
import { StorageKey } from "@jee-common/storage-keys" ;
import dayjs from "dayjs";
import { Session } from "./session";

@Injectable()
export class SessionStateService {

  storageSvc: LocalStorageService   = inject( LocalStorageService ) ;
  networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;

  syllabuses: SyllabusSO[] = [];
  sessionTypes: SessionTypeSO[] = [];
  activeTopicsMap: Record<string, { topic:TopicSO, assignment:TopicTrackAssignmentSO, syllabus:SyllabusSO}[]> = {} ;

  // This encapsulates all the information related to the current session.
  // Note that a session can be active, inactive or in being-configured state. A session is
  // active iff its id is > 0.
  session:Session = new Session( this.networkSvc, this.storageSvc ) ;

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
      this.session.setSelectedSessionType( this.sessionTypes[0] ) ;
    }
  }

  /**
   * Given a topic, return true if the topic is active on the date returned by
   * #getCurrentDate() function.
   *
   * @param topic TopicSO instance
   */
  public isTopicActive( topic:TopicSO ) {
    let selectedSyllabusName = this.session.syllabus()!.syllabusName ;
    if( selectedSyllabusName in this.activeTopicsMap ) {
      return this.activeTopicsMap[ selectedSyllabusName ]
        .map( obj => obj.topic )
        .includes( topic ) ;
    }
    return false ;
  }
}