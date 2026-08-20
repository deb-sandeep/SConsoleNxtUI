import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";
import { TagQuerySearchRes } from "@jee-common/util/tag-query-types";

// Grouping classes for the results tree — Syllabus > Topic > (Problems:
// Book/Chapter > Exercise, Questions: flat), mirroring problem-history's own
// BookChapter/Exercise classes one level down (see
// projects/app-jee-mdm/src/features/problem-history/problem-history.component.ts).
// Unlike problem-history (one topic at a time), a tag query can span many
// topics/syllabi at once, so this adds the two outer levels.

export class ExerciseResults {

  problems:TopicProblemSO[] = [] ;
  collapsed = true ;

  constructor( public exerciseName:string ) {}

  addProblem( p:TopicProblemSO ) {
    this.problems.push( p ) ;
  }
}

export class BookChapterResults {

  exerciseGroups:Record<string, ExerciseResults> = {} ;
  collapsed = false ;

  constructor( public bookChapterName:string ) {}

  addProblem( p:TopicProblemSO ) {
    const exerciseName = p.exerciseNum + ". " + p.exerciseName ;
    let exercise = this.exerciseGroups[ exerciseName ] ;
    if( !exercise ) {
      exercise = new ExerciseResults( exerciseName ) ;
      this.exerciseGroups[ exerciseName ] = exercise ;
    }
    exercise.addProblem( p ) ;
  }
}

export class TopicResults {

  bookChapters:Record<string, BookChapterResults> = {} ;
  questions:QuestionSO[] = [] ;
  collapsed = false ;

  constructor( public topicId:number, public topicName:string ) {}

  addProblem( p:TopicProblemSO ) {
    const bookChapterName = "[" + p.bookShortName + "] " + p.chapterNum + ". " + p.chapterName ;
    let bookChapter = this.bookChapters[ bookChapterName ] ;
    if( !bookChapter ) {
      bookChapter = new BookChapterResults( bookChapterName ) ;
      this.bookChapters[ bookChapterName ] = bookChapter ;
    }
    bookChapter.addProblem( p ) ;
  }

  addQuestion( q:QuestionSO ) {
    this.questions.push( q ) ;
  }
}

export class SyllabusResults {

  topics:Record<number, TopicResults> = {} ;
  collapsed = false ;

  constructor( public syllabusName:string ) {}

  getOrCreateTopic( topicId:number, topicName:string ):TopicResults {
    let topic = this.topics[ topicId ] ;
    if( !topic ) {
      topic = new TopicResults( topicId, topicName ) ;
      this.topics[ topicId ] = topic ;
    }
    return topic ;
  }
}

export function buildResultsTree( res:TagQuerySearchRes | null ):Record<string, SyllabusResults> {
  const bySyllabus:Record<string, SyllabusResults> = {} ;
  if( !res ) return bySyllabus ;

  const getSyllabus = ( name:string ):SyllabusResults => {
    let s = bySyllabus[ name ] ;
    if( !s ) {
      s = new SyllabusResults( name ) ;
      bySyllabus[ name ] = s ;
    }
    return s ;
  } ;

  res.problems.items.forEach( p =>
    getSyllabus( p.syllabusName ).getOrCreateTopic( p.topicId, p.topicName ).addProblem( p )
  ) ;
  res.questions.items.forEach( q =>
    getSyllabus( q.syllabusName ).getOrCreateTopic( q.topicId, q.topicName ).addQuestion( q )
  ) ;

  return bySyllabus ;
}
