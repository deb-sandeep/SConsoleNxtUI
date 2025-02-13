import { Component, computed, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import dayjs from 'dayjs';
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

  getHeight():number {
    let numDays = dayjs( this.schedule().endDate ).diff( dayjs( this.schedule().startDate ), 'days' ) ;
    return numDays * 3 ;
  }
}
