import { Component, input, OnChanges, OnInit } from '@angular/core';
import { NgClass } from "@angular/common";

class Cell {
  classes:string[] = [] ;
}

@Component({
  selector: 'burn-bar',
  imports: [
    NgClass
  ],
  templateUrl: './burn-bar.component.html',
  styleUrl: './burn-bar.component.css'
})
export class BurnBarComponent implements OnInit, OnChanges {

  currentBurnRate = input.required<number>() ;
  requiredBurnRate = input.required<number>() ;
  numProblemsSolvedToday = input.required<number>() ;

  cells: Cell[] = [] ;

  ngOnChanges() {
    this.updateState() ;
  }

  ngOnInit() {
    this.updateState() ;
  }

  private updateState() {
    const numCells = Math.max( this.currentBurnRate(),
      this.requiredBurnRate(),
      this.numProblemsSolvedToday() ) + 2 ;

    this.cells = [] ;

    for( let i = 0; i < numCells; i++) {
      const cell = new Cell() ;

      if( i < this.numProblemsSolvedToday() ) {
        if( i < this.currentBurnRate() ) {
          cell.classes.push( "under-burn" ) ;
        }
        else if( i < this.requiredBurnRate() ) {
          cell.classes.push( "normal-burn" ) ;
        }
        else {
          cell.classes.push( "over-burn" ) ;
        }
      }
      else if( i < this.requiredBurnRate() ) {
        cell.classes.push( "unburnt" ) ;
      }

      if( i == this.currentBurnRate()-1 ) {
        cell.classes.push( "current-burn-marker" ) ;
      }
      else if( i == this.requiredBurnRate()-1 ) {
        cell.classes.push( "required-burn-marker" ) ;
      }

      this.cells.push( cell ) ;
    }
  }
}
