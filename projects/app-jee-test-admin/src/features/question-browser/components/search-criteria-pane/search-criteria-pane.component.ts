import { Component, inject, ViewChild } from '@angular/core';
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem,
  NgbNav, NgbNavChangeEvent,
  NgbNavContent,
  NgbNavItem,
  NgbNavLinkButton,
  NgbNavOutlet
} from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule } from "@angular/forms";
import { TopicListComponent } from "../topic-list/topic-list.component";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO } from "@jee-common/util/master-data-types";

@Component({
  selector: 'search-criteria-pane',
  imports: [
    NgbAccordionBody,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionDirective,
    NgbAccordionHeader,
    NgbAccordionItem,
    ReactiveFormsModule,
    NgbNav,
    NgbNavItem,
    NgbNavLinkButton,
    NgbNavContent,
    NgbNavOutlet,
    TopicListComponent
  ],
  templateUrl: './search-criteria-pane.component.html',
  styleUrl: './search-criteria-pane.component.css'
})
export class SearchCriteriaPaneComponent {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  @ViewChild( "phyTopics" )
  phyTopics : TopicListComponent ;

  @ViewChild( "chemTopics" )
  chemTopics : TopicListComponent ;

  @ViewChild( "mathTopics" )
  mathTopics : TopicListComponent ;

  syllabusMap:Record<string, SyllabusSO|undefined> = {} ;

  constructor() {
    this.fetchSyllabusAndTopics().then() ;
  }

  private async fetchSyllabusAndTopics() {
    let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
    syllabusSOList.forEach( so => {
      this.syllabusMap[so.syllabusName] = so
    } ) ;
  }

  topicSelectionChanged( $event: number[] ) {
  }

  syllabusChanged( $event: NgbNavChangeEvent ) {
    switch( $event.nextId )  {
      case 1 : this.phyTopics.emitSelectedTopics() ; break ;
      case 2 : this.chemTopics.emitSelectedTopics() ; break ;
      case 3 : this.mathTopics.emitSelectedTopics() ; break ;
    }
  }
}
