import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";

@Component({
  selector: 'section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css'
})
export class SectionHeaderComponent {

  examSvc = inject( JeeMainService ) ;
}
