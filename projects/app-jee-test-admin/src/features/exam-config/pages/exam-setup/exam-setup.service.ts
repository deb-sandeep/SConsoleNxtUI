import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";

interface ExamSection {
  problemType: string;
  title: string;
  correctMarks: number;
  wrongPenalty: number;
  numQuestions: number;
  numCompulsoryQuestions: number;
  instructions: string;
}

interface ExamSetupConfig {
  examType: string;
  examSections: ExamSection[];
}

@Injectable()
export class ExamSetupService extends RemoteService {

  examSetupConfig = {
    examType : "MAIN",
    examSections : [],
  }
}