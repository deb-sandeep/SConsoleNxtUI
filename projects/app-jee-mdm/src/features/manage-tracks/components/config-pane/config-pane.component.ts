import { Component, inject } from '@angular/core';
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective, NgbAccordionHeader, NgbAccordionItem
} from "@ng-bootstrap/ng-bootstrap";
import { ManageTracksService } from "../../manage-tracks.service";
import { FormsModule } from "@angular/forms";
import { DndModule } from "ngx-drag-drop";
import { ConfigUtil } from "../../util/cfg-util";
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'config-pane',
    imports: [
        NgbAccordionBody,
        NgbAccordionButton,
        NgbAccordionCollapse,
        NgbAccordionDirective,
        NgbAccordionHeader,
        NgbAccordionItem,
        FormsModule,
        DndModule,
        DatePipe
    ],
  templateUrl: './config-pane.component.html',
  styleUrl: './config-pane.component.css'
})
export class ConfigPaneComponent {

  svc:ManageTracksService = inject( ManageTracksService ) ;

  protected readonly Object = Object;

  areAllTopicsScheduled():boolean {
    if( this.svc.selectedSyllabus() ) {
      let topics = Object.values( this.svc.selectedSyllabus().topicMap ) ;
      for( let topic of topics ) {
        if( !this.svc.selectedSyllabus().isTopicScheduled( topic ) ) {
          return false ;
        }
      }
    }
    return true ;
  }

  refreshInitializationData() {
    const selectedSyllabusName:string = this.svc.selectedSyllabusName ;
    this.svc.refreshInitializationData()
        .then( () => this.svc.setSelectedSyllabusName( selectedSyllabusName ) ) ;
  }

  setDefaultCoachingNumDays() {
    const selectedSyllabusName:string = this.svc.selectedSyllabusName ;
    const selTs = this.svc.selectedTopicSchedule ;
    selTs!.coachingNumDays = ConfigUtil.getCoachingNumDays( selectedSyllabusName ) ;
    selTs!.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  setDefaultSelfStudyNumDays() {
    const selectedSyllabusName:string = this.svc.selectedSyllabusName ;
    const selTs = this.svc.selectedTopicSchedule ;
    selTs!.selfStudyNumDays = ConfigUtil.getSelfStudyNumDays( selectedSyllabusName ) ;
    selTs!.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  setDefaultConsolidationNumDays() {
    const selTs = this.svc.selectedTopicSchedule ;
    selTs!.consolidationNumDays = TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS ;
    selTs!.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  setDefaultInterTopicGapNumDays() {
    const selTs = this.svc.selectedTopicSchedule ;
    selTs!.interTopicGapNumDays = 0 ;
    selTs!.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  setAllNumDayDefaultValues() {
    const selectedSyllabusName:string = this.svc.selectedSyllabusName ;
    const selTs = this.svc.selectedTopicSchedule ;
    selTs!.coachingNumDays = ConfigUtil.getCoachingNumDays( selectedSyllabusName ) ;
    selTs!.selfStudyNumDays = ConfigUtil.getSelfStudyNumDays( selectedSyllabusName ) ;
    selTs!.consolidationNumDays = TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS ;
    selTs!.interTopicGapNumDays = 0 ;
    selTs!.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  topicScheduleUpdated( ts:TopicSchedule ) {
    ts.numDaysEdited() ;
    this.svc.notifyTopicScheduleUpdated() ;
  }
}
