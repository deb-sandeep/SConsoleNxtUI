import { Component, computed, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe, DecimalPipe } from "@angular/common";

@Component({
  selector: 'topic-schedule',
  imports: [
    DatePipe,
    DecimalPipe
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
}
