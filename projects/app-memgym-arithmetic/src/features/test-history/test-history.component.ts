import { Component } from '@angular/core';
import {PageToolbarActionItemMeta} from "lib-core";

@Component({
  selector: 'feature-test-history',
  standalone: true,
  imports: [],
  templateUrl: './test-history.component.html',
  styleUrl: './test-history.component.css'
})
export class TestHistoryComponent {

  title:string = "Test History" ;
  toolbarButtonsMeta:PageToolbarActionItemMeta[] = [
    /*
    { name:"Button1", iconName:"clock-history", action: this.button1Action, style:'primary' },
    { name:"Button2", style:'success', action: this.button2Action },
    { type:"spacer" },
    { type:'checkbox', name:'Checkbox1', action: this.checkboxClicked }
     */
  ] ;

  button1Action() {
    console.log( "Button 1 clicked" ) ;
  }

  button2Action() {
    console.log( "Button 2 clicked" ) ;
  }

  checkboxClicked( event:boolean ) : void {
    console.log( "Checkbox clicked " + event ) ;
  }
}
