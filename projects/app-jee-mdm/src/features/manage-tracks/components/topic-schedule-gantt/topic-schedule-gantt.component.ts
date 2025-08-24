import { Component, ElementRef, ViewChild, inject, AfterViewInit, OnDestroy } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;
import { ManageTracksService } from "../../manage-tracks.service" ;
import { GanttChartRenderer, GanttChartConfig } from './gantt-chart-renderer' ;

@Component({
  selector: 'topic-schedule-gantt',
  standalone: true,
  imports: [CommonModule] ,
  templateUrl: './topic-schedule-gantt.component.html' ,
  styleUrl: './topic-schedule-gantt.component.css' 
})
export class TopicScheduleGanttComponent implements AfterViewInit, OnDestroy {

  @ViewChild('cornerCanvas') cornerCanvasRef!: ElementRef<HTMLCanvasElement> ;
  @ViewChild('headerCanvas') headerCanvasRef!: ElementRef<HTMLCanvasElement> ;
  @ViewChild('labelsCanvas') labelsCanvasRef!: ElementRef<HTMLCanvasElement> ;
  @ViewChild('contentCanvas') contentCanvasRef!: ElementRef<HTMLCanvasElement> ;

  public svc: ManageTracksService = inject(ManageTracksService) ;

  private cornerCanvas!: HTMLCanvasElement ;
  private headerCanvas!: HTMLCanvasElement ;
  private labelsCanvas!: HTMLCanvasElement ;
  private contentCanvas!: HTMLCanvasElement ;
  private resizeObserver!: ResizeObserver ;
  private renderer!: GanttChartRenderer ;

  // Gantt chart configuration
  private config: GanttChartConfig = {
    rowHeight: 17,
    headerHeight: 40,
    labelWidth: 250,
    dayWidth: 5,

    headerFont: '11px Arial',
    trackHeaderFont: 'bold 12px Arial',
    topicFont: '11px Arial',
    blockFont: '10px Arial',

    headerBackgroundColor: '#e0e0e0',
    trackHeaderBackgroundColor: '#f0f0f0',
    gridLineColor: '#ddd',
    monthGridLineColor: '#d36767',
    weekGridLineColor: '#bbb',
    headerSeparatorColor: '#999',
    rowSeparatorColor: '#eee',
    blockBorderColor: '#333',
    blockTextColor: '#fff',

    phaseColors: {
      coaching: '#4CAF50',     // Green
      selfStudy: '#2196F3',    // Blue
      exercise: '#FFC107',     // Yellow
      consolidation: '#FF5722' // Orange
    }
  };

  constructor() {} 

  ngAfterViewInit(): void {

    this.cornerCanvas = this.cornerCanvasRef.nativeElement ;
    this.headerCanvas = this.headerCanvasRef.nativeElement ;
    this.labelsCanvas = this.labelsCanvasRef.nativeElement ;
    this.contentCanvas = this.contentCanvasRef.nativeElement ;

    this.renderer = new GanttChartRenderer({
      cornerCanvas: this.cornerCanvas ,
      headerCanvas: this.headerCanvas ,
      labelsCanvas: this.labelsCanvas ,
      contentCanvas: this.contentCanvas
    }, this.config) ;

    // Set up a resize observer to handle canvas resizing
    this.resizeObserver = new ResizeObserver(() => {
      this.renderer.resizeCanvases() ;
      this.renderGanttChart() ;
    }) ;

    // Observe the content container for size changes
    const contentContainer = this.contentCanvas.parentElement!;
    this.resizeObserver.observe(contentContainer) ;

    // Set up scroll synchronization
    contentContainer.addEventListener('scroll', this.handleContentScroll) ;

    // Set up scroll synchronization for labels container
    const labelsContainer = this.labelsCanvas.parentElement!;
    labelsContainer.addEventListener('scroll', this.handleLabelsScroll) ;

    // Initial render
    this.renderer.resizeCanvases();
    this.renderGanttChart();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Remove scroll event listeners
    const contentContainer = this.contentCanvas.parentElement;
    if (contentContainer) {
      contentContainer.removeEventListener('scroll', this.handleContentScroll);
    }

    const labelsContainer = this.labelsCanvas.parentElement;
    if (labelsContainer) {
      labelsContainer.removeEventListener('scroll', this.handleLabelsScroll ) ;
    }
  }

  private renderGanttChart(): void {
    const syllabus = this.svc.selectedSyllabus() ;
    if( !syllabus ) return ;

    // Render the Gantt chart using the renderer
    this.renderer.renderGanttChart( syllabus.tracks ) ;
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
