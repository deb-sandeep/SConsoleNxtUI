import { Component, inject, input } from '@angular/core';
import { QuestionBrowserService } from "../../question-browser.service";
import { QuestionSearchResSO } from "../../question-browser.type";
import { NgIf } from "@angular/common";

type PageRef = {
  pageNumber: number;
  isCurrentPage: boolean;
  isEllipses: boolean;
}

@Component( {
  selector: 'paging-control',
  templateUrl: './paging-control.component.html',
  imports: [
    NgIf
  ],
  styleUrl: './paging-control.component.css'
})
export class PagingControlComponent {

  static readonly NUM_LEADING_REFERENCES = 10 ;
  static readonly NUM_LAGGING_REFERENCES = 10 ;

  qBrowserSvc : QuestionBrowserService = inject( QuestionBrowserService ) ;

  searchResults = input<QuestionSearchResSO>() ;
  pageRefs: PageRef[] = [] ;

  ngOnChanges() {
    const totalPages = this.searchResults()!.totalPages ;
    const currentPage = this.searchResults()!.pageNumber ;

    let startPage = currentPage - PagingControlComponent.NUM_LEADING_REFERENCES;
    let lastPage = currentPage + PagingControlComponent.NUM_LAGGING_REFERENCES;

    this.pageRefs.length = 0 ;

    if( startPage < 0 ) {
      startPage = 0 ;
    }
    else {
      if( startPage > 1 ) {
        this.pageRefs.push( this.ref( 0 ) ) ;
        this.pageRefs.push( this.ellipses() ) ;
      }
    }

    if( lastPage >= totalPages ) {
      lastPage = totalPages-1 ;
    }


    for( let i = startPage; i <= lastPage; i++ ) {
      this.pageRefs.push( this.ref( i ) );
    }

    if( lastPage < totalPages-2 ) {
      this.pageRefs.push( this.ellipses() ) ;
      this.pageRefs.push( this.ref( totalPages-1 ) ) ;
    }
  }

  private ref( pageNum: number ): PageRef {
    return {
      pageNumber: pageNum,
      isCurrentPage: pageNum == this.searchResults()!.pageNumber,
      isEllipses: pageNum == -1
    }
  }

  private ellipses() {
    return this.ref( -1 ) ;
  }

  showPage( pageNumber: number ) {
    this.qBrowserSvc.fetchResultsPage( pageNumber ) ;
  }

  hasPrevPage() {
    return this.searchResults()!.pageNumber > 0 ;
  }

  hasNextPage() {
    return this.searchResults()!.pageNumber <
           this.searchResults()!.totalPages - 1  ;
  }

  showNextPage() {
    const currentPage = this.searchResults()!.pageNumber ;
    this.qBrowserSvc.fetchResultsPage( currentPage + 1 ) ;
  }

  showPrevPage() {
    const currentPage = this.searchResults()!.pageNumber ;
    this.qBrowserSvc.fetchResultsPage( currentPage - 1 ) ;
  }
}
