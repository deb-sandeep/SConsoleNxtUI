import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { ExamApiService } from "../../exam-api.service";
import { ExamConfig } from "@jee-common/util/exam-data-types";
import { Router } from "@angular/router";


@Component({
  selector: 'question-repo',
    imports: [
        FormsModule,
        DatePipe,
    ],
  templateUrl: './exam-listing.component.html',
  styleUrl: './exam-listing.component.css'
})
export class ExamListingComponent {

    private router = inject( Router );

    apiSvc: ExamApiService = inject( ExamApiService ) ;
    availableExams: ExamConfig[] ;

    constructor() {
        this.apiSvc.getListOfExams().then((exams) => {
            this.availableExams = [] ;
            for( let exam of exams ){
                if( exam.state === "PUBLISHED" ) {
                    this.availableExams.push( exam ) ;
                }
            }
        })
    }

    protected startExam( exam: ExamConfig ) {
        this.router.navigateByUrl( `/jee-main/${exam.id}` ).then() ;
    }
}
