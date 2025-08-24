import { Component, inject, input, ViewChild } from '@angular/core';
import dayjs from 'dayjs';
import { DndDropEvent, DndModule } from "ngx-drag-drop";

import { TopicScheduleComponent } from "../topic-schedule/topic-schedule.component";
import { Track } from "../../entities/track";
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe } from "@angular/common";
import { NgbDateStruct, NgbDatepickerModule, NgbDate, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { ConfigUtil } from "../../util/cfg-util";
import { ManageTracksService } from "../../manage-tracks.service";

@Component({
  selector: 'study-track',
  imports: [ DndModule, TopicScheduleComponent, DatePipe, NgbDatepickerModule, FormsModule ],
  template: `
    @if( track() ) {
      @let trackBgColor = track().colors.bodyBackground ;
      @let titleBgColor = track().colors.titleBackground ;
      @let titleFgColor = track().colors.titleForeground ;

      <div class="track"
           [style.background-color]="trackBgColor"
           [style.width]="getTrackWidth()"
           dndDropzone
           (dndDrop)="topicDropped( $event )"
           dndDragoverClass="drag-over">
        <div class="track-title"
             [style.background-color]="titleBgColor"
             [style.color]="titleFgColor">
          <div class="track-start-date" (click)="toggleDatePicker($event)">
            {{ track().scheduleListHead?.startDate | date }}
          </div>
          <div class="track-name">[ {{ track().trackName }} ]</div>
          <div class="track-end-date">{{ track().scheduleListTail?.endDate | date}}</div>
        </div>
        <div class="topic-list">
          @for( topicSchedule of track(); track topicSchedule.topic.id ) {
            <topic-schedule [schedule]="topicSchedule"></topic-schedule>
          }
        </div>
        @if( showDatePicker ) {
          <div class="date-picker-overlay" (click)="closeDatePicker($event)">
            <div class="date-picker-container" (click)="$event.stopPropagation()">
              <ngb-datepicker #dp
                              [(ngModel)]="selectedDate"
                              (dateSelect)="onDateSelect($event)">
              </ngb-datepicker>
            </div>
          </div>
        }
      </div>
    }
  `,
  styleUrl: './track.component.css'
})
export class TrackComponent {

  @ViewChild('dp') datepicker: NgbDatepicker | undefined;

  private svc = inject( ManageTracksService ) ;

  track = input.required<Track>() ;
  showDatePicker = false;
  selectedDate: NgbDateStruct | null = null;

  public getTrackWidth():string {
    let numTracks = this.track().syllabus.tracks.length ;
    return `calc(100%/${numTracks})` ;
  }

  public topicDropped( event:DndDropEvent ):void {

    const topicId = event.data ;
    const droppedTopic = this.track().syllabus.getTopic( topicId ) ;

    const defaultDurationInDays = droppedTopic.getDefaultExerciseDuration() ;

    let selfStudyMargin = ConfigUtil.getSelfStudyNumDays( this.track().syllabusName ) ;
    let coachingMargin = ConfigUtil.getCoachingNumDays( this.track().syllabusName ) ;

    let startDate = this.track().getNextStartDate() ;
    const endDate = dayjs( startDate ).add( defaultDurationInDays, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_COACHING_NUM_DAYS, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS, 'days' )
                                             .add( selfStudyMargin, 'days' )
                                             .toDate() ;

    const schedule = new TopicSchedule({
      trackId:this.track().id,
      sequence:this.track().getNumTopicsScheduled()+1,
      topicId:droppedTopic.id,
      startDate:startDate,
      coachingNumDays:coachingMargin,
      selfStudyNumDays:selfStudyMargin,
      consolidationNumDays:TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS,
      endDate:endDate,
      interTopicGapNumDays:TopicSchedule.DEFAULT_INTER_TOPIC_GAP_NUM_DAYS
    }, this.track(), droppedTopic ) ;

    this.track().addTopicSchedule( schedule ) ;
    this.track().syllabus.svc.setSelectedTopicSchedule( schedule ) ;
  }

  public toggleDatePicker( event: MouseEvent ): void {
    event.stopPropagation();
    this.showDatePicker = !this.showDatePicker;
    if( this.showDatePicker ) {
      const startDate = this.track().startDate;
      if( startDate ) {
        const date = new Date(startDate);
        this.selectedDate = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        } ;

        // Navigate the datepicker to the selected month and year
        setTimeout(() => {
          if (this.datepicker) {
            this.datepicker.navigateTo({
              year: this.selectedDate!.year,
              month: this.selectedDate!.month,
            });
          }
        });
      }
    }
  }

  public closeDatePicker(event: MouseEvent): void {
    event.stopPropagation();
    this.showDatePicker = false;
  }

  public onDateSelect(date: NgbDate): void {
    const selectedDate = new Date(date.year, date.month - 1, date.day);
    this.track().setTrackStartDate(selectedDate);
    this.showDatePicker = false;
    this.svc.notifyTopicScheduleUpdated() ;
  }
}
