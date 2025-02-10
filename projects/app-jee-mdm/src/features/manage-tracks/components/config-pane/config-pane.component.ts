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

  topicDragStarted( event:DragEvent ) {
    console.log( 'Topic drag started', event ) ;
  }

  topicDragEnded( event:DragEvent ) {
    console.log( 'Topic drag ended', event ) ;
  }

  topicMoved( event:DragEvent ) {
    console.log( 'Topic moved', event ) ;
  }
}
