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
import { Topic } from "../../../../base-types";

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
}
