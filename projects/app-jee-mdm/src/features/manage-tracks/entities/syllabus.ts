import { SyllabusSO, TrackSO } from "../../../server-object-types" ;
import { Topic } from "./topic";
import { Track } from "./track";
import { Colors } from "../util/colors";
import { ManageTracksService } from "../manage-tracks.service";

export class Syllabus {

  public svc:ManageTracksService ;

  public syllabusName: string ;
  public subjectName: string ;
  public colors: Colors ;

  public topicMap:Record<string, Topic> = {} ;
  public tracks:Track[] = [] ;

  public constructor( vo:SyllabusSO, svc:ManageTracksService ) {

    this.svc = svc ;

    this.syllabusName = vo.syllabusName ;
    this.subjectName = vo.subjectName ;
    this.colors = new Colors( vo.color ) ;

    vo.topics.forEach( tso => this.topicMap[tso.id] = new Topic( tso, this ) ) ;
  }

  public addTrack( tso:TrackSO ) {

    const newTrack = new Track( tso, this ) ;
    if( this.tracks.length != 0 ) {
      const lastTrack = this.tracks[ this.tracks.length - 1 ] ;
      newTrack.prevTrack = lastTrack ;
      lastTrack.nextTrack = newTrack ;
    }
    this.tracks.push( newTrack ) ;
  }

  public getTopic( topicId:number ) : Topic {
    return this.topicMap[topicId] ;
  }

  public isTopicScheduled( topic:Topic ) : boolean {
    for( const track of this.tracks ) {
      if( track.containsTopic( topic) ) return true ;
    }
    return false ;
  }

  isDirty() {
    for( let track of this.tracks ) {
      if( track.isDirty() ) return true ;
    }
    return false ;
  }
}