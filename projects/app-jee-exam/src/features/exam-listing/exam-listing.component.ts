import { Component } from "@angular/core";
import {
  PageTitleComponent,
} from "lib-core";


@Component({
  selector: 'question-repo',
  imports: [
    PageTitleComponent,
  ],
  templateUrl: './exam-listing.component.html',
  styleUrl: './exam-listing.component.css'
})
export class ExamListingComponent {

  constructor() {
  }
}
