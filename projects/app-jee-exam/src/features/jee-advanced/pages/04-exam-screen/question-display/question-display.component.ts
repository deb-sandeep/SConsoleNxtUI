import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'question-display',
  imports: [],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  protected readonly Math = Math ;

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected getQuestionTypeLabel( problemType: string ): string {
    switch( problemType ) {
      case "SCA": return "MCQ" ;
      case "MCA": return "MSQ" ;
      case "NVT": return "NVT" ;
      case "IVT": return "NVT" ;
      case "MMT": return "MM" ;
      case "CMT": return "MM" ;
      case "ART": return "MCQ" ;
    }
    return problemType ;
  }
}
