import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ExamAttemptSO } from "@jee-common/util/exam-data-types";
import { TimeSequenceRenderer, TimeSequenceConfig } from "./time-sequence-renderer";

@Component({
  selector: 'div[timeSequence]',
  imports: [],
  templateUrl: './time-sequence.component.html',
  styleUrl: './time-sequence.component.css'
})
export class TimeSequenceComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  @ViewChild('cornerCanvas')
  cornerRef!: ElementRef<HTMLCanvasElement> ;

  @ViewChild('headerCanvas')
  headerRef!: ElementRef<HTMLCanvasElement> ;

  @ViewChild('labelsCanvas')
  labelsRef!: ElementRef<HTMLCanvasElement> ;

  @ViewChild('contentCanvas')
  contentRef!: ElementRef<HTMLCanvasElement> ;

  private cornerCanvas!: HTMLCanvasElement ;
  private headerCanvas!: HTMLCanvasElement ;
  private labelsCanvas!: HTMLCanvasElement ;
  private contentCanvas!: HTMLCanvasElement ;

  private resizeObserver!: ResizeObserver ;
  private renderer!: TimeSequenceRenderer ;

  private config: Partial<TimeSequenceConfig> = {};

  ngAfterViewInit(): void {

    this.cornerCanvas = this.cornerRef.nativeElement ;
    this.headerCanvas = this.headerRef.nativeElement ;
    this.labelsCanvas = this.labelsRef.nativeElement ;
    this.contentCanvas = this.contentRef.nativeElement ;

    this.renderer = new TimeSequenceRenderer( this.eval!, this.config, {
      corner: this.cornerCanvas ,
      header: this.headerCanvas ,
      labels: this.labelsCanvas ,
      content: this.contentCanvas
    } ) ;

    this.resizeObserver = new ResizeObserver(() => {
      this.renderer.resizeCanvases() ;
    }) ;

    // Observe the content container for size changes
    const contentContainer = this.contentCanvas.parentElement! ;
    contentContainer.addEventListener('scroll', this.handleContentScroll ) ;
    this.resizeObserver.observe( contentContainer ) ;

    // Set up scroll synchronization for labels container
    const labelsContainer = this.labelsCanvas.parentElement! ;
    labelsContainer.addEventListener('scroll', this.handleLabelsScroll ) ;

    console.log( 'Rendering chart after ngViewInit' ) ;
    this.renderer.resizeCanvases();
    this.renderer.render() ;
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    const contentContainer = this.contentCanvas.parentElement;
    if( contentContainer ) {
      contentContainer.removeEventListener('scroll', this.handleContentScroll);
    }

    const labelsContainer = this.labelsCanvas.parentElement;
    if( labelsContainer ) {
      labelsContainer.removeEventListener('scroll', this.handleLabelsScroll ) ;
    }
  }

  private handleContentScroll = () => {
    const contentContainer = this.contentCanvas.parentElement!;

    // Sync header canvas with horizontal scroll
    const headerContainer = this.headerCanvas.parentElement!;
    headerContainer.scrollLeft = contentContainer.scrollLeft;

    // Sync labels canvas with vertical scroll
    const labelsContainer = this.labelsCanvas.parentElement!;
    labelsContainer.scrollTop = contentContainer.scrollTop;
  };

  private handleLabelsScroll = () => {
    const labelsContainer = this.labelsCanvas.parentElement!;
    const contentContainer = this.contentCanvas.parentElement!;

    // Sync content canvas with vertical scroll from labels
    contentContainer.scrollTop = labelsContainer.scrollTop;
  };
}
