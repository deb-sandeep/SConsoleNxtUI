import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'exam-analysis',
  imports: [ RouterOutlet ],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class ExamAnalysisComponent {}
