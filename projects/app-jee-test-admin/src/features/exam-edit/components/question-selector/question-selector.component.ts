import { Component, input } from '@angular/core';
import { ExamSectionConfig } from "../../../../type";

@Component({
  selector: 'div[questionSelector]',
  imports: [],
  templateUrl: './question-selector.component.html',
  styleUrl: './question-selector.component.css'
})
export class QuestionSelectorComponent {

  sectionCfg = input<ExamSectionConfig>() ;
}
