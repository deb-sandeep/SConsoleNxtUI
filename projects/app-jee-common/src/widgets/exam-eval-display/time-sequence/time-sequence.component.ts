import { Component, ElementRef, Input, output, ViewChild } from '@angular/core';
import { ExamAttemptSO, ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { TimeSequenceRenderer, TimeSequenceConfig } from "./time-sequence-renderer";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";

@Component( {
  selector: 'div[timeSequence]',
  templateUrl: './time-sequence.component.html',
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrl: './time-sequence.component.css'
})
export class TimeSequenceComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  questionSelected = output<ExamQuestionAttemptSO>() ;

  @ViewChild('headerCanvas')
  headerRef!: ElementRef<HTMLCanvasElement> ;

  @ViewChild('labelsCanvas')
  labelsRef!: ElementRef<HTMLCanvasElement> ;

  @ViewChild('contentCanvas')
  contentRef!: ElementRef<HTMLCanvasElement> ;

  private headerCanvas!: HTMLCanvasElement ;
  private labelsCanvas!: HTMLCanvasElement ;
  private contentCanvas!: HTMLCanvasElement ;

  private resizeObserver!: ResizeObserver ;

  private config: Partial<TimeSequenceConfig> = {} ;

  renderer: TimeSequenceRenderer ;
  applyActivationDurationThreshold = true ;
  showFullScreen = false ;

  ngAfterViewInit(): void {

    this.headerCanvas = this.headerRef.nativeElement ;
    this.labelsCanvas = this.labelsRef.nativeElement ;
    this.contentCanvas = this.contentRef.nativeElement ;

    this.renderer = new TimeSequenceRenderer( this.eval!,
                                              this.config,
                                              this.headerCanvas,
                                              this.labelsCanvas,
                                              this.contentCanvas ) ;

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

    this.installClickHandler() ;

    this.renderer.resizeCanvases();
    this.renderer.render() ;
  }

  private installClickHandler() {
    this.labelsCanvas.addEventListener( 'click', this.handleLabelsClick ) ;
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

    if( this.labelsCanvas ) {
      this.labelsCanvas.removeEventListener( 'click', this.handleLabelsClick ) ;
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
  } ;

  private handleLabelsClick = ( event: MouseEvent ) => {
    const rect = this.labelsCanvas.getBoundingClientRect() ;
    const x = event.clientX - rect.left ;
    const y = event.clientY - rect.top ;

    const attempt = this.renderer.getQuestionAttemptAtLabelPoint( x, y ) ;
    if( attempt != null ) {
      this.questionSelected.emit( attempt ) ;
    }
  } ;

  public selectQuestionAttempt( questionAttempt: ExamQuestionAttemptSO ) {
    this.renderer.selectQuestionAttempt( questionAttempt ) ;
  }

  protected toggleActivationThreshold() {
    this.renderer.applyActivityDurationThreshold( this.applyActivationDurationThreshold ) ;
  }

  protected toggleFullScreen() {
    this.showFullScreen = !this.showFullScreen ;
    requestAnimationFrame( () => {
      this.renderer.resizeCanvases() ;
    } ) ;
  }
}
