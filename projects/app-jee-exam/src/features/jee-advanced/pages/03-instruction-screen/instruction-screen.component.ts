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

  // JEE Advanced 2027 runs in May 2027; the banner switches to the next exam cycle
  // once that exam is behind us.
  private static readonly BANNER_CUTOVER_DATE = new Date( 2027, 5, 1 ) ;

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute ) ;

  protected confirmation: boolean = false ;

  protected bannerImage: string = new Date() < InstructionScreenComponent.BANNER_CUTOVER_DATE
    ? 'img/jee-adv-banner-2027.png'
    : 'img/jee-adv-banner-2028.png' ;

  protected proceed() {
    // TODO: once JeeAdvancedService exists, mirror jee-main's flow of calling
    // examSvc.createExamAttempt() before navigating, so an attempt/timer is started.
    this.router.navigate( [ '../exam-screen' ], { relativeTo: this.route } ).then();
  }
}
