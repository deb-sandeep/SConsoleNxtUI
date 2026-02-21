import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { Router } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'configure-duration',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './configure-duration.component.html',
  styleUrl: './configure-duration.component.css'
})
export class ConfigureDurationComponent {

  protected readonly Math = Math;

  svc = inject( ExamSetupService ) ;
  router = inject( Router ) ;

  duration : number = 0 ;
  notes : string = "" ;

  ngOnInit() {
    this.duration = Math.round( this.svc.getRecommendedDuration() / 60 ) ;
  }

  isConfigurationInvalid() {
    return this.duration <= 0 ;
  }

  saveExamDraft() {
    this.svc.setupConfig.duration = this.duration * 60 ;
    this.svc.setupConfig.notes = this.notes ;
    this.svc.saveExamConfig() ;
    // TODO: Receive the result and forward it to exam edit route
  }
}
