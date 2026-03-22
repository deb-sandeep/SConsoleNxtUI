import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from "../04-exam-screen/page-header/page-header.component";
import { JeeMainService } from "../../jee-main.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'submit-screen',
  imports: [
    PageHeaderComponent,
  ],
  templateUrl: './submit-screen.component.html',
  styleUrl: './submit-screen.component.css'
})
export class SubmitScreenComponent {

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute );

  examSvc = inject( JeeMainService ) ;

  protected goBackToExamScreen() {
    this.router.navigate( [ '../exam-screen' ], { relativeTo: this.route } ).then();
  }
}
