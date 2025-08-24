import { config } from "../manage-tracks.config";
import { TopicSchedule } from "../entities/topic-schedule";

export class ConfigUtil {

  static getSelfStudyNumDays( syllabusName:string ) {

    if( syllabusName.includes( 'Physics' ) ) {
      return config.defaultSelfStudyNumDays.physics ;
    }
    else if( syllabusName.includes( 'Chemistry' ) ) {
      return config.defaultSelfStudyNumDays.chemistry ;
    }
    else if( syllabusName.includes( 'Maths' ) ) {
      return config.defaultSelfStudyNumDays.maths ;
    }
    else if( syllabusName.includes( 'Reasoning' ) ) {
      return config.defaultSelfStudyNumDays.reasoning ;
    }
    return TopicSchedule.DEFAULT_TOPIC_SELF_STUDY_NUM_DAYS ;
  }

  static getCoachingNumDays( syllabusName:string) {

    if( syllabusName.includes( 'Physics' ) ) {
      return config.defaultCoachingNumDays.physics ;
    }
    else if( syllabusName.includes( 'Chemistry' ) ) {
      return config.defaultCoachingNumDays.chemistry ;
    }
    else if( syllabusName.includes( 'Maths' ) ) {
      return config.defaultCoachingNumDays.maths ;
    }
    else if( syllabusName.includes( 'Reasoning' ) ) {
      return config.defaultCoachingNumDays.reasoning ;
    }
    return TopicSchedule.DEFAULT_TOPIC_COACHING_NUM_DAYS ;
  }
}