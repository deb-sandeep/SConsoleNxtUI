import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { getJeeAdvancedBannerImages } from "../../../jee-advanced-banner.util";

@Component({
  selector: 'page-header',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected bannerImageLhs: string = getJeeAdvancedBannerImages().lhs ;
  protected bannerImageRhs: string = getJeeAdvancedBannerImages().rhs ;
}
