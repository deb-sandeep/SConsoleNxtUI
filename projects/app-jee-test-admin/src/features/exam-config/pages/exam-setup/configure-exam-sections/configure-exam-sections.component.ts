import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { Router } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-configure-exam-sections',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './configure-exam-sections.component.html',
  styleUrl: './configure-exam-sections.component.css'
})
export class ConfigureExamSectionsComponent {

  examSetupSvc = inject( ExamSetupService ) ;
  router = inject( Router ) ;

  ngOnInit(): void {
  }

  protected showNextDialog() {
  }

  protected isConfigurationInvalid() {
    return false ;
  }
}
