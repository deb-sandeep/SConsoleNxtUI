import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { ExamService } from "../../../../exam.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'instruction-screen',
  imports: [
    NgOptimizedImage,
    FormsModule
  ],
  templateUrl: './instruction-screen.component.html',
  styleUrl: './instruction-screen.component.css'
})
export class InstructionScreenComponent {

  examSvc = inject( ExamService ) ;
  protected confirmation: boolean = false ;

  protected proceed() {
    console.log( "Start exam" ) ;
  }

  getDuration() {
    if( this.examSvc.examConfig ) {
      return this.examSvc.examConfig.duration / 60 ;
    }
    return 0 ;
  }
}
