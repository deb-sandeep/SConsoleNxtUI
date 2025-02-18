import { Component, computed, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe, DecimalPipe, NgIf } from "@angular/common";

@Component({
  selector: 'topic-schedule',
  imports: [
    DatePipe,
    DecimalPipe,
    NgIf
  ],
  templateUrl: './topic-schedule.component.html',
  styleUrl: './topic-schedule.component.css'
})
export class TopicScheduleComponent {

  schedule = input.required<TopicSchedule>() ;
  colors = computed( () => this.schedule().topic.syllabus.colors ) ;

  recomputeExerciseDays() {
    this.schedule().recomputeExerciseDays() ;
    this.schedule().track!.recomputeScheduleSequenceAttributes() ;
  }

  getDefaultNumExerciseDays() {
    return this.schedule().topic.getDefaultExerciseDuration() ;
  }

  getNumExerciseDays() {
    return this.schedule().exerciseDays ;
  }
}
