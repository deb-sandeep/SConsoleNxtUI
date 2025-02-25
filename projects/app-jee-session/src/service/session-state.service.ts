import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from "lib-core";

import { SessionNetworkService } from "./session-network.service";
import { SessionTypeSO, SyllabusSO, TopicSO, TopicTrackAssignmentSO } from "@jee-common/master-data-types";
import { StorageKey } from "@jee-common/storage-keys" ;

@Injectable()
export class SessionStateService {

  storageSvc: LocalStorageService = inject( LocalStorageService ) ;
  networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;

  syllabuses: SyllabusSO[] = [];
  sessionTypes: SessionTypeSO[] = [];
  activeTopicsMap: Record<string, { topic:TopicSO, assignment:TopicTrackAssignmentSO, syllabus:SyllabusSO}[]> = {} ;

  selectedSessionType:SessionTypeSO|null = null ;
  selectedSyllabus = signal<SyllabusSO|null>(null);
  selectedTopic = signal<TopicSO|null>(null) ;

  async loadMasterData() {

    this.syllabuses = await this._loadMasterData( () => this.networkSvc.getAllSyllabus(), StorageKey.SYLLABUSES ) ;
    this.sessionTypes = await this._loadMasterData( () => this.networkSvc.getSessionTypes(), StorageKey.SESSION_TYPES ) ;

    let currentAssignments = await this.networkSvc.getCurrentTrackAssignments() ;
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
          this.selectedSessionType = st ;
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

  public isTopicActive( topic:TopicSO ) {
    let activeTopics = this.activeTopicsMap[this.selectedSyllabus()!.syllabusName].map( obj => obj.topic ) ;
    return activeTopics.includes( topic ) ;
  }

  public sessionTypeSelected( st: SessionTypeSO ) {
    this.selectedSessionType = st ;
    this.storageSvc.setItem( StorageKey.LAST_SESSION_TYPE, st.sessionType ) ;
  }

  public syllabusSelected( s: SyllabusSO ) {
    this.selectedSyllabus.set( s ) ;
    this.selectedTopic.set( null ) ;
  }

  public topicSelected( t: TopicSO ) {
    this.selectedTopic.set( t ) ;
  }
}