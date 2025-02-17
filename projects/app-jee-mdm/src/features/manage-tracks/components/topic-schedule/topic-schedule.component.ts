import { Component, computed, inject, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe, DecimalPipe } from "@angular/common";
import { Router } from "@angular/router";

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

  router:Router = inject( Router ) ;
}
