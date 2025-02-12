import { SyllabusSO, TrackSO } from "../../../server-object-types" ;
import { Topic } from "./topic";
import { Track } from "./track";
import { Colors } from "../util/colors";

export class Syllabus {

  public syllabusName: string ;
  public subjectName: string ;
  public colors: Colors ;

  public topicMap:Record<string, Topic> = {} ;
  public tracks:Track[] = [] ;

  public constructor( vo:SyllabusSO ) {

    this.syllabusName = vo.syllabusName ;
    this.subjectName = vo.subjectName ;
    this.colors = new Colors( vo.color ) ;

    vo.topics.forEach( tso => this.topicMap[tso.id] = new Topic( tso, this ) ) ;
  }

  public addTrack( tso:TrackSO ) {

    const newTrack = new Track( tso, this ) ;
    if( this.tracks.length != 0 ) {
      const lastTrack = this.tracks[ this.tracks.length - 1 ] ;
      newTrack.previousTrack = lastTrack ;
      lastTrack.nextTrack = newTrack ;
    }
    this.tracks.push( new Track( tso, this ) ) ;
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
}