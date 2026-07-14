import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
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
  private route = inject( ActivatedRoute ) ;

  protected confirmation: boolean = false ;

  protected proceed() {
    // TODO: once JeeAdvancedService exists, mirror jee-main's flow of calling
    // examSvc.createExamAttempt() before navigating, so an attempt/timer is started.
    this.router.navigate( [ '../exam-screen' ], { relativeTo: this.route } ).then();
  }
}
