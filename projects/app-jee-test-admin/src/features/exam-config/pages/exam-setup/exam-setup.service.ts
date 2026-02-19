import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";
import { ExamSectionTemplate } from "./exam-section.config";

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
  selectedSectionTemplates: ExamSectionTemplate[];
  examSections: ExamSection[];
}

@Injectable()
export class ExamSetupService extends RemoteService {

  examSetupConfig : ExamSetupConfig = {
    examType : "MAIN",
    selectedSectionTemplates : [],
    examSections : [],
  }
}