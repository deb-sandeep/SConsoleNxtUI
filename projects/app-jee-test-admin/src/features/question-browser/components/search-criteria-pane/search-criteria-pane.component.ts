import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
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
import { QuestionBrowserService } from "../../question-browser.service";

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
export class SearchCriteriaPaneComponent implements AfterViewInit {

  private sylApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;
  private qBrowserSvc : QuestionBrowserService = inject( QuestionBrowserService ) ;

  private selectedTopicIds: number[] = [];
  private syllabusLoaded = false ;
  private viewReady = false ;
  private pendingRouteSelection: { topicId: number, qType: string } | null = null ;

  activeSyllabusTabId = 1 ;

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

  ngAfterViewInit(): void {
    this.viewReady = true ;
    this.applyPendingRouteSelection() ;
  }

  private async fetchSyllabusAndTopics() {
    let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
    syllabusSOList.forEach( so => {
      this.syllabusMap[so.syllabusName] = so
    } ) ;
    this.syllabusLoaded = true ;
    this.applyPendingRouteSelection() ;
  }

  applyRouteDrivenSelection( topicId: number, qType: string ) {
    this.pendingRouteSelection = { topicId, qType } ;
    this.applyPendingRouteSelection() ;
  }

  private applyPendingRouteSelection() {
    if( !this.pendingRouteSelection || !this.syllabusLoaded || !this.viewReady ) {
      return ;
    }

    const tabId = this.getSyllabusTabIdForTopic( this.pendingRouteSelection.topicId ) ;
    if( tabId == -1 ) {
      this.pendingRouteSelection = null ;
      return ;
    }

    this.activeSyllabusTabId = tabId ;
    const topicListComp = this.getTopicListForTab( tabId ) ;
    if( !topicListComp ) {
      return ;
    }

    topicListComp.setSelectedTopics( [this.pendingRouteSelection.topicId] ) ;
    this.selectedTopicIds = [this.pendingRouteSelection.topicId] ;
    this.pendingRouteSelection = null ;
  }

  private getSyllabusTabIdForTopic( topicId: number ): number {

    if( this.syllabusMap['IIT Physics']?.topics.some( t => t.id === topicId ) ) {
      return 1 ;
    }
    if( this.syllabusMap['IIT Chemistry']?.topics.some( t => t.id === topicId ) ) {
      return 2 ;
    }
    if( this.syllabusMap['IIT Maths']?.topics.some( t => t.id === topicId ) ) {
      return 3 ;
    }
    return -1 ;
  }

  private getTopicListForTab( tabId: number ): TopicListComponent | undefined {

    switch( tabId ) {
      case 1: return this.phyTopics ;
      case 2: return this.chemTopics ;
      case 3: return this.mathTopics ;
      default: return undefined ;
    }
  }

  topicSelectionChanged( $event: number[] ) {
    this.selectedTopicIds = $event;
  }

  syllabusChanged( $event: NgbNavChangeEvent ) {
    switch( $event.nextId )  {
      case 1 : this.phyTopics.emitSelectedTopics() ; break ;
      case 2 : this.chemTopics.emitSelectedTopics() ; break ;
      case 3 : this.mathTopics.emitSelectedTopics() ; break ;
    }
    this.applyPendingRouteSelection() ;
  }

  isSearchCriteriaInvalid() {
    return this.selectedTopicIds.length == 0;
  }

  search() {
    this.qBrowserSvc.initiateFreshSearch( this.selectedTopicIds ) ;
  }
}
