import { Component, computed, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import dayjs from 'dayjs';

@Component({
  selector: 'topic-schedule',
  imports: [],
  templateUrl: './topic-schedule.component.html',
  styleUrl: './topic-schedule.component.css'
})
export class TopicScheduleComponent {

  topicSchedule = input.required<TopicSchedule>() ;
  colors = computed( () => this.topicSchedule().topic.syllabus.colors ) ;

  getHeight():number {
    let numDays = dayjs( this.topicSchedule().endDate ).diff( dayjs( this.topicSchedule().startDate ), 'days' ) ;
    return numDays * 1.5 ;
  }
}
