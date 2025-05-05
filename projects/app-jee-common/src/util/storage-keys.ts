export class StorageKey {

  // Stores SyllabusSO[]
  static readonly SYLLABUSES = "syllabuses" ;

  // Stores SessionType[]
  static readonly SESSION_TYPES = "session-types" ;

  // Stores string value -> syllabus_name
  static readonly LAST_VISITED_SYLLABUS = "lastVisitedSyllabus" ;

  // Stores the last selected session type
  static readonly LAST_SESSION_TYPE = "lastSessionType" ;

  // Stores an array of last exercise pointers against topics.
  // Used to present the last exercise done in an expanded state during
  // problem selection
  static readonly LAST_EXERCISE_POINTERS = "lastExercisePointers" ;
}