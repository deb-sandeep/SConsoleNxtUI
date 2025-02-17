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
    DndModule
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
    let selectedSyllabusName:string = this.svc.selectedSyllabusName ;
    this.svc.refreshInitializationData()
        .then( () => this.svc.setSelectedSyllabusName( selectedSyllabusName ) ) ;
  }
}
