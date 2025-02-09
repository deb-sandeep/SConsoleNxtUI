import { effect, inject, Injectable, signal } from '@angular/core';
import { Alert, PageTitleService, RemoteService } from "lib-core";

import { environment } from "../../../../environments/environment";
import { Syllabus, Topic, Track } from "../../base-types" ;
import { Colors } from "./util/colors";
import { TopicProblemCounts } from "./manage-tracks.types";

import AlertService = Alert.AlertService;

@Injectable()
export class ManageTracksService extends RemoteService {

  // These are fetched from the server during initialization of this feature.
  public syllabusList:Syllabus[] = [] ;
  public trackList:Track[] = [] ;
  public topicProblemCounts:TopicProblemCounts[] = [] ;

  // These are derived data, initialized once the server data is fetched made available.
  public syllabusTopics:Record<string, Topic[]> = {} ;
  public syllabusTracks:Record<string, Track[]> = {} ;

  public syllabusColors:Record<string, Colors> = {} ;
  public trackColors:Record<number, Colors> = {} ;

  private titleSvc:PageTitleService = inject( PageTitleService ) ;
  private alertSvc:AlertService = inject( AlertService ) ;

  public selectedSyllabus = signal('') ;

  constructor() {
    super();
    effect( () => this.syllabusSelectionChanged( this.selectedSyllabus() ) ) ;
  }

  public fetchInitializationData() {
    this.getAllSyllabus()
        .then( syllabusList => this.syllabusList = syllabusList )
        .then( () => this.getAllTracks() )
        .then( tracks => this.trackList = tracks )
        .then( () => this.getTopicProblemCounts() )
        .then( problemCounts => this.topicProblemCounts = problemCounts )
        .then( () => this.postProcessInitializationData() )
        .catch( err => this.alertSvc.error( 'Error : ' + err) ) ;
  }

  public postProcessInitializationData() {

    this.selectedSyllabus.set( this.syllabusList[0]?.syllabusName ) ;

    this.syllabusList.forEach( s => {
      this.syllabusColors[ s.syllabusName ] = new Colors( s.color ) ;
      this.syllabusTopics[ s.syllabusName ] = s.topics
    } ) ;

    this.trackList.forEach( t => {
      this.trackColors[ t.id ] = new Colors( t.color ) ;
      if( !(t.syllabusName in this.syllabusTracks) ) {
        this.syllabusTracks[t.syllabusName] = [] ;
      }
      this.syllabusTracks[t.syllabusName].push(t) ;
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

  public getTopicProblemCounts():Promise<TopicProblemCounts[]> {
    const url:string = `${environment.apiRoot}/Master/Topic/ProblemTypeCounts` ;
    return this.getPromise( url, true ) ;
  }

  public getActiveTracks():Track[] {
    return this.syllabusTracks[ this.selectedSyllabus() ] ;
  }

  isTopicAssigned( topic:Topic ) {
    const tracks = this.getActiveTracks() ;
    for( const track of tracks ) {
      for( const topicAssignment of track.assignedTopics ) {
        if( topicAssignment.topicId == topic.id ) {
          return true ;
        }
      }
    }
    return false ;
  }

}
