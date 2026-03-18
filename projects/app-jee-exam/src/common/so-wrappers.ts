import { ExamQuestionConfig } from "@jee-common/util/exam-data-types";

export class ExamSection {

    public firstQuestion: ExamQuestion ;

    constructor( public sectionName: string,
                 public subjectName: string ) {}
}

export class ExamQuestion {

    nextQuestion: ExamQuestion|null = null ;
    prevQuestion: ExamQuestion|null = null ;

    constructor( public index: number,
                 public questionConfig: ExamQuestionConfig ) {}
}