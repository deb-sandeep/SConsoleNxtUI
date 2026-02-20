import { Injectable, signal } from '@angular/core';
import { RemoteService } from "lib-core";
import { ExamSectionTemplate } from "./exam-section.config";

import { environment } from "@env/environment";

export interface ExamSection {
  syllabusName: string;
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
  selectedSubjects: string[];
  selectedSectionTemplates: ExamSectionTemplate[];
  examSections: ExamSection[];
}

@Injectable()
export class ExamSetupService extends RemoteService {

  examSetupConfig : ExamSetupConfig = {
    examType : "MAIN",
    selectedSubjects : [],
    selectedSectionTemplates : [],
    examSections : [],
  }

  resetSectionConfig() {
    this.examSetupConfig = {
      examType : "MAIN",
      selectedSubjects : [],
      selectedSectionTemplates : [],
      examSections : [],
    }
  }
}