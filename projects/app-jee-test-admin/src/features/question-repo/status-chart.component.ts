import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { QTypeStatusSO } from './question-repo.type';

@Component({
  selector: 'status-chart',
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class StatusChartComponent implements AfterViewInit, OnChanges {

  @Input() maxValue: number = 0;
  @Input() statusData: QTypeStatusSO | null = null;

  @ViewChild('chartCanvas' ) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Configurable colors for the bars
  readonly UNASSIGNED_COLOR: string = '#82ef1b'; // Light gray
  readonly ASSIGNED_COLOR: string = '#f8b888';   // Light blue
  readonly ATTEMPTED_COLOR: string = '#707070';  // Light green
  readonly BORDER_COLOR: string = '#cfcfcf';     // Light gray

  // Configurable text properties
  readonly TEXT_COLOR: string = '#2e2e2e';       // White for better contrast
  readonly TEXT_FONT_SIZE: number = 14;          // Increased font size for better visibility

  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {}

  ngAfterViewInit(): void {
    this.initCanvas();
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if( (changes['maxValue'] || changes['statusData'] ) && this.ctx ) {
      this.drawChart();
    }
  }

  private initCanvas(): void {
    const canvas = this.chartCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');

    // Set canvas dimensions to match its display size
    this.resizeCanvas();

    // Add resize listener
    window.addEventListener('resize',() => {
      this.resizeCanvas();
      this.drawChart();
    });
  }

  private resizeCanvas(): void {
    if( !this.ctx ) return;

    const canvas = this.chartCanvas.nativeElement;
    const container = canvas.parentElement;

    if( container ) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }

  private drawChart(): void {
    if( !this.ctx || !this.statusData || this.maxValue <= 0 ) return;

    const canvas = this.chartCanvas.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    this.ctx.clearRect(0, 0, width, height);

    // Calculate bar dimensions
    const barHeight = height * 0.9; // 60% of the canvas height
    const barY =( height - barHeight ) / 2; // Center the bar vertically

    // Calculate segment widths based on their proportion of maxValue
    const unassignedWidth =( this.statusData.numUnassigned / this.maxValue ) * width;
    const assignedWidth =( this.statusData.numAssigned / this.maxValue ) * width;
    const attemptedWidth =( this.statusData.numAttempted / this.maxValue ) * width;

    // Draw the segments from left to right
    let currentX = 0;

    // Draw unassigned segment
    if( this.statusData.numUnassigned > 0 ) {
      this.ctx.fillStyle = this.UNASSIGNED_COLOR;
      this.ctx.fillRect(currentX, barY, unassignedWidth, barHeight);

      // Display numUnassigned value on top of the unassigned bar
      this.ctx.fillStyle = this.TEXT_COLOR;
      this.ctx.font = `${this.TEXT_FONT_SIZE}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.statusData.numUnassigned.toString(), 
        currentX + (unassignedWidth / 2), 
        barY + barHeight / 2
      );

      currentX += unassignedWidth;
    }

    // Draw assigned segment
    if( this.statusData.numAssigned > 0 ) {
      this.ctx.fillStyle = this.ASSIGNED_COLOR;
      this.ctx.fillRect(currentX, barY, assignedWidth, barHeight);
      currentX += assignedWidth;
    }

    // Draw attempted segment
    if( this.statusData.numAttempted > 0 ) {
      this.ctx.fillStyle = this.ATTEMPTED_COLOR;
      this.ctx.fillRect(currentX, barY, attemptedWidth, barHeight);
    }

    // Draw border around the entire bar
    this.ctx.strokeStyle = this.BORDER_COLOR ;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, barY, unassignedWidth + assignedWidth + attemptedWidth, barHeight);
  }
}
