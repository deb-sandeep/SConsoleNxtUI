import { Component, ElementRef, input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-dayjs-4';
import { BurnChartVO, BurnPointVO } from "../../util/burn-chart-types";

Chart.register( LineController, LineElement, PointElement, LinearScale, TimeScale, annotationPlugin ) ;

// Mirrors ActiveTopicStatistics.ZONE_BOUNDS / zoneIndexFor in the desktop app.
const ZONE_BOUNDS = [ -1.0, -0.40, -0.30, -0.20, 0.00, 0.20, 0.38, 0.66, 0.84, 0.96, 1.0 ] ;

function zoneIndexFor( score: number ): number {
  if( score < -0.40 ) return 0 ;
  if( score < -0.30 ) return 1 ;
  if( score < -0.20 ) return 2 ;
  if( score <=  0.00 ) return 3 ;
  if( score <  0.20 ) return 4 ;
  if( score <  0.38 ) return 5 ;
  if( score <  0.66 ) return 6 ;
  if( score <  0.84 ) return 7 ;
  if( score <  0.96 ) return 8 ;
  return 9 ;
}

// h, s, v in [0,1] — standard HSB/HSV to RGB conversion. CSS hsl() is NOT
// equivalent to Java's Color.getHSBColor() used by ActiveTopicStatistics.scoreColor(),
// so the conversion is done by hand rather than emitting an hsl() string.
function hsbToRgbString( h: number, s: number, v: number ): string {
  const i = Math.floor( h * 6 ) ;
  const f = h * 6 - i ;
  const p = v * ( 1 - s ) ;
  const q = v * ( 1 - f * s ) ;
  const t = v * ( 1 - ( 1 - f ) * s ) ;
  let r = 0, g = 0, b = 0 ;
  switch( i % 6 ) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return `rgb(${ Math.round( r * 255 ) }, ${ Math.round( g * 255 ) }, ${ Math.round( b * 255 ) })` ;
}

// Mirrors ActiveTopicStatistics.scoreColor() exactly (HSB, not HSL).
function scoreColor( score: number ): string {
  if( score <= 0 ) {
    const brightness = 0.55 + 0.35 * ( -score ) ;
    return hsbToRgbString( 0.33, 1.0, brightness ) ;
  }
  const hue = Math.max( 0, 0.165 * ( 1.0 - score ) ) ;
  return hsbToRgbString( hue, 1.0, 0.9 ) ;
}

function lerpRgb( from: number[], to: number[], t: number ): string {
  const r = Math.round( from[0] + ( to[0] - from[0] ) * t ) ;
  const g = Math.round( from[1] + ( to[1] - from[1] ) * t ) ;
  const b = Math.round( from[2] + ( to[2] - from[2] ) * t ) ;
  return `rgb(${ r }, ${ g }, ${ b })` ;
}

const ZONE_BAR_GREEN = [ 0x00, 0xff, 0x00 ] ;
const ZONE_BAR_GRAY  = [ 0xa0, 0xa0, 0xa0 ] ;
const ZONE_BAR_RED   = [ 0xff, 0x00, 0x00 ] ;

@Component({
  selector: 'burn-chart',
  imports: [],
  templateUrl: './burn-chart.component.html',
  styleUrl: './burn-chart.component.css'
})
export class BurnChartComponent implements AfterViewInit, OnDestroy {

  data = input.required<BurnChartVO>() ;

  @ViewChild( 'chartCanvas' ) chartCanvasRef!: ElementRef<HTMLCanvasElement> ;
  @ViewChild( 'zoneBarCanvas' ) zoneBarCanvasRef!: ElementRef<HTMLCanvasElement> ;

  scoreLabelText: string = '' ;
  scoreLabelStyle: Record<string, string> = {} ;

  private chart: Chart<'line', { x: string, y: number }[]> | null = null ;

  ngAfterViewInit() {
    // Deferred to a macrotask (rather than rendering synchronously here) —
    // mutating scoreLabelText/scoreLabelStyle within ngAfterViewInit itself
    // would trigger NG0100, since Angular's dev-mode re-check pass runs
    // immediately afterwards, still within the same tick.
    setTimeout( () => this.render() ) ;
  }

  ngOnDestroy() {
    this.chart?.destroy() ;
  }

  private toPoints( pts: BurnPointVO[] ) {
    return pts.map( p => ( { x: p.date, y: p.remaining } ) ) ;
  }

  private lineAnnotation( isoDate: string ) {
    return { type: 'line' as const, scaleID: 'x', value: isoDate, borderColor: '#808080', borderWidth: 1 } ;
  }

  private render() {
    const data = this.data() ;
    const plan = data.plan ;

    const annotations: Record<string, unknown> = {
      startLine: this.lineAnnotation( plan.startDate ),
      exerciseEndLine: this.lineAnnotation( plan.exerciseEndDate ),
    } ;
    if( plan.coachingEndDate != null ) {
      annotations['coachingEndLine'] = this.lineAnnotation( plan.coachingEndDate ) ;
    }
    if( plan.selfStudyEndDate != null ) {
      annotations['selfStudyEndLine'] = this.lineAnnotation( plan.selfStudyEndDate ) ;
    }
    if( plan.endDate !== plan.exerciseEndDate ) {
      annotations['endLine'] = this.lineAnnotation( plan.endDate ) ;
    }

    const config: ChartConfiguration<'line', { x: string, y: number }[]> = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Ideal burn',
            data: this.toPoints( data.idealBurn ),
            borderColor: '#808080',
            borderDash: [ 2, 6 ],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
          {
            label: 'Projected burn',
            data: this.toPoints( data.projectedBurn ),
            borderColor: '#ff0000',
            borderDash: [ 2, 6 ],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
          {
            label: 'Actual burn',
            data: this.toPoints( data.actualBurn ),
            borderColor: '#00ff00',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          annotation: { annotations } as never,
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day', displayFormats: { day: 'D/M' } },
            grid: { color: '#333333' },
            ticks: { color: '#cccccc' },
          },
          y: {
            type: 'linear',
            min: 0,
            max: plan.numTotalProblems * 1.05,
            grid: { color: '#333333' },
            ticks: { color: '#cccccc', callback: ( value ) => Math.round( Number( value ) ) },
          },
        },
        onResize: () => {
          this.renderZoneBar() ;
          this.positionScoreLabel() ;
        },
      },
    } ;

    this.chart = new Chart( this.chartCanvasRef.nativeElement, config ) ;

    this.renderZoneBar() ;
    this.positionScoreLabel() ;
  }

  private positionScoreLabel() {
    if( !this.chart ) return ;
    const xScale = this.chart.scales[ 'x' ] ;
    const yScale = this.chart.scales[ 'y' ] ;
    if( !xScale || !yScale ) return ;

    const plan = this.data().plan ;
    const xPx = xScale.getPixelForValue( new Date( plan.exerciseEndDate ).getTime() ) ;
    const yPx = yScale.getPixelForValue( plan.numTotalProblems ) ;
    const canvasWidth = this.chartCanvasRef.nativeElement.clientWidth ;

    this.scoreLabelText = this.data().status.scoreLabel ;
    this.scoreLabelStyle = {
      right: `${ Math.max( 0, canvasWidth - xPx ) }px`,
      top: `${ Math.max( 0, yPx ) }px`,
      color: scoreColor( this.data().status.burnStressScore ),
    } ;
  }

  private renderZoneBar() {
    const canvas = this.zoneBarCanvasRef.nativeElement ;
    canvas.width = canvas.clientWidth ;
    canvas.height = canvas.clientHeight ;

    const ctx = canvas.getContext( '2d' ) ;
    if( !ctx ) return ;

    const width = canvas.width ;
    const height = canvas.height ;
    ctx.clearRect( 0, 0, width, height ) ;

    const score = this.data().status.burnStressScore ;
    const zoneIdx = zoneIndexFor( score ) ;
    const zoneLow = ZONE_BOUNDS[ zoneIdx ] ;
    const zoneHigh = ZONE_BOUNDS[ zoneIdx + 1 ] ;
    const fraction = Math.min( 1, Math.max( 0, ( score - zoneLow ) / ( zoneHigh - zoneLow ) ) ) ;

    ctx.strokeStyle = '#404040' ;
    ctx.lineWidth = 1 ;
    ctx.beginPath() ;
    ctx.moveTo( 0, height / 2 ) ;
    ctx.lineTo( width, height / 2 ) ;
    ctx.stroke() ;

    const dotX = fraction * width ;
    const dotColor = fraction <= 0.5
      ? lerpRgb( ZONE_BAR_GREEN, ZONE_BAR_GRAY, fraction / 0.5 )
      : lerpRgb( ZONE_BAR_GRAY, ZONE_BAR_RED, ( fraction - 0.5 ) / 0.5 ) ;

    ctx.fillStyle = dotColor ;
    ctx.beginPath() ;
    ctx.arc( dotX, height / 2, 4, 0, Math.PI * 2 ) ;
    ctx.fill() ;
  }
}
