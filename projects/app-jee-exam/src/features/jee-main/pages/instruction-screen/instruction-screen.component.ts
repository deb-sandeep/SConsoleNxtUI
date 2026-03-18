import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { JeeMainService } from "../../jee-main.service";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

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

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute );

  examSvc = inject( JeeMainService ) ;
  protected confirmation: boolean = false ;

  protected proceed() {
    this.router.navigate( [ '../exam-screen' ], { relativeTo: this.route } ).then();
  }

  getDuration() {
    if( this.examSvc.examConfig ) {
      return this.examSvc.examConfig.duration / 60 ;
    }
    return 0 ;
  }
}
