import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from "@angular/common";

@Component( {
  selector: 'toolbar-action',
  imports: [ CommonModule ],
  templateUrl: './toolbar-action.component.html',
  styleUrl: './toolbar-action.component.css'
})
export class ToolbarActionComponent implements OnInit {

  @Input( "type" )
  type:'button' | 'checkbox' | 'spacer' = 'button' ;

  @Input( "icon" )
  icon:string | null = null ;

  @Input( "name" )
  name:string = "" ;

  @Input( "style" )
  style:'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'secondary' ;

  @Output( "click" )
  clickEmitter:EventEmitter<any> = new EventEmitter<any>() ;

  @Output( "change" )
  changeEmitter:EventEmitter<boolean> = new EventEmitter<boolean>() ;

  ngOnInit() {
    this.clickEmitter = new EventEmitter<any>() ;
    this.changeEmitter = new EventEmitter<boolean>() ;
  }

  isButton() : boolean {
    return this.type === 'button' ;
  }

  isCheckbox() : boolean {
    return this.type === 'checkbox' ;
  }

  isSpacer( ) : boolean {
    return this.type === 'spacer' ;
  }

  buttonClicked() {
    this.clickEmitter.emit() ;
  }

  checkboxClicked( event:any ) {
    this.changeEmitter.emit( event.currentTarget.checked ) ;
  }
}
