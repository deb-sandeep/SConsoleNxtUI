import { Component, inject } from '@angular/core';
import { NgClass } from "@angular/common";
import { PageHeaderComponent } from "./page-header/page-header.component";
import { SectionHeaderComponent } from "./section-header/section-header.component";
import { QuestionPaletteComponent } from "./question-palette/question-palette.component";
import { SubmitPanelComponent } from "./submit-panel/submit-panel.component";
import { QuestionActionPanelComponent } from "./question-action-panel/question-action-panel.component";
import { QuestionDisplayComponent } from "./question-display/question-display.component";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'exam-screen',
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        NgClass,
        QuestionPaletteComponent,
        SubmitPanelComponent,
        QuestionActionPanelComponent,
        QuestionDisplayComponent
    ],
  templateUrl: './exam-screen.component.html',
  styleUrl: './exam-screen.component.css'
})
export class ExamScreenComponent {

    private readonly MAX_PANEL_WIDTH_PCT = 25 ;

    eventLogSvc = inject( EventLogService ) ;

    paletteCollapsed = false ;

    questionDisplayWidth() {
        return this.paletteCollapsed ? '100%' : `${100 - this.MAX_PANEL_WIDTH_PCT}%` ;
    }

    paletteDisplayWidth() {
        return this.paletteCollapsed ? '0' : `${this.MAX_PANEL_WIDTH_PCT}%` ;
    }

    protected togglePalette() {
        this.paletteCollapsed = !this.paletteCollapsed ;
        this.eventLogSvc.logPaletteToggle( this.paletteCollapsed ) ;
    }
}
