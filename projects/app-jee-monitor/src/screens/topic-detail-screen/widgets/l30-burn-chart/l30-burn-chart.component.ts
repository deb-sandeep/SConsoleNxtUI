import { AfterViewInit, Component, ElementRef, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  LinearScale,
} from 'chart.js';
import dayjs from 'dayjs';
import { DayCountPointVO } from "../../../../service/response-payload.types";

Chart.register( BarController, BarElement, CategoryScale, LinearScale ) ;

@Component({
  selector: 'l30-burn-chart',
  imports: [],
  templateUrl: './l30-burn-chart.component.html',
  styleUrl: './l30-burn-chart.component.css'
})
export class L30BurnChartComponent implements OnInit, AfterViewInit, OnDestroy {

  points = input.required<DayCountPointVO[]>() ;

  @ViewChild( 'chartCanvas' ) chartCanvasRef!: ElementRef<HTMLCanvasElement> ;

  private chart: Chart<'bar', number[], string> | null = null ;

  ngOnInit() {}

  ngAfterViewInit() {
    this.render() ;
  }

  ngOnDestroy() {
    this.chart?.destroy() ;
  }

  private render() {
    const pts = this.points() ;

    const config: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: pts.map( p => dayjs( p.date ).format( 'D/M' ) ),
        datasets: [ {
          label: 'Problems solved',
          data: pts.map( p => p.numSolved ),
          backgroundColor: '#00bfff',
        } ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#cccccc', autoSkip: true, maxTicksLimit: 10 },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#333333' },
            ticks: { color: '#cccccc', precision: 0 },
          },
        },
      },
    } ;

    this.chart = new Chart( this.chartCanvasRef.nativeElement, config ) ;
  }
}
