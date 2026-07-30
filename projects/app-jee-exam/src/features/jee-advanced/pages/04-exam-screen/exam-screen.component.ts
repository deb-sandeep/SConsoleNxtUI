import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from "./page-header/page-header.component";
import { ExamToolbarComponent } from "./exam-toolbar/exam-toolbar.component";
import { PaperBreadcrumbBarComponent } from "./paper-breadcrumb-bar/paper-breadcrumb-bar.component";
import { SectionHeaderComponent } from "./section-header/section-header.component";
import { QuestionDisplayComponent } from "./question-display/question-display.component";
import { QuestionActionPanelComponent } from "./question-action-panel/question-action-panel.component";
import { CandidateInfoPanelComponent } from "./candidate-info-panel/candidate-info-panel.component";
import { QuestionStatusLegendComponent } from "./question-status-legend/question-status-legend.component";
import { QuestionPaletteComponent } from "./question-palette/question-palette.component";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'exam-screen',
  imports: [
    PageHeaderComponent,
    ExamToolbarComponent,
    PaperBreadcrumbBarComponent,
    SectionHeaderComponent,
    QuestionDisplayComponent,
    QuestionActionPanelComponent,
    CandidateInfoPanelComponent,
    QuestionStatusLegendComponent,
    QuestionPaletteComponent
  ],
  templateUrl: './exam-screen.component.html',
  styleUrl: './exam-screen.component.css'
})
export class ExamScreenComponent {

  eventLogSvc = inject( EventLogService ) ;

  paletteCollapsed = false ;

  protected togglePalette() {
    this.paletteCollapsed = !this.paletteCollapsed ;
    this.eventLogSvc.logPaletteToggle( this.paletteCollapsed ) ;
  }
}
