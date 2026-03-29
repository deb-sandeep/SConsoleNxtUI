import { Component, Input } from '@angular/core';
import { ExamAttemptSO, ExamSectionAttemptSO } from "@jee-common/util/exam-data-types";
import { NgClass } from "@angular/common";

class SectionEvalSummary {

  sectionName: string;
  numQuestions: number;
  totalMarks: number;
  score: number;
  avoidablePct: number;

  constructor( sectionAttempt: ExamSectionAttemptSO ) {
    this.sectionName = this.constructSectionName( sectionAttempt ) ;
    this.numQuestions = sectionAttempt.examSection.numCompulsoryQuestions ;
    this.totalMarks = sectionAttempt.examSection.numCompulsoryQuestions *
                      sectionAttempt.examSection.correctMarks ;
    this.score = sectionAttempt.score ;
    this.avoidablePct = sectionAttempt.avoidableLossPct ;
  }

  private constructSectionName( sAttempt: ExamSectionAttemptSO ) {
    const syllabus = sAttempt.examSection.syllabusName ;
    const problemType = sAttempt.examSection.problemType ;
    return syllabus.substring( 4 ) + " : " + problemType ;
  }
}

@Component({
  selector: 'div[sectionEval]',
  imports: [
    NgClass
  ],
  templateUrl: './section-eval.component.html',
  styleUrl: './section-eval.component.css'
})
export class SectionEvalComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  sectionSummaries: SectionEvalSummary[] = [] ;

  ngOnChanges() {
    for( let attempt of this.eval!.sectionAttempts ) {
      this.sectionSummaries.push( new SectionEvalSummary( attempt ) );
    }
  }
}
