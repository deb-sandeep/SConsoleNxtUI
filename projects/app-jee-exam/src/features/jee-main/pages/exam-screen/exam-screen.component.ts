import { Component } from '@angular/core';
import { NgClass } from "@angular/common";
import { PageHeaderComponent } from "./page-header/page-header.component";
import { SectionHeaderComponent } from "./section-header/section-header.component";
import { QuestionPaletteComponent } from "./question-palette/question-palette.component";

@Component({
  selector: 'exam-screen',
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        NgClass,
        QuestionPaletteComponent
    ],
  templateUrl: './exam-screen.component.html',
  styleUrl: './exam-screen.component.css'
})
export class ExamScreenComponent {

    paletteCollapsed = false ;
}
