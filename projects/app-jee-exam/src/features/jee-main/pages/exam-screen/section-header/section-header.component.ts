import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { ExamSection } from "../../../../../common/so-wrappers";

@Component({
  selector: 'section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css'
})
export class SectionHeaderComponent {

  examSvc = inject( JeeMainService ) ;

  protected jumpToSection( section: ExamSection ) {
    this.examSvc.activateQuestion( section.firstQuestion ) ;
  }
}
