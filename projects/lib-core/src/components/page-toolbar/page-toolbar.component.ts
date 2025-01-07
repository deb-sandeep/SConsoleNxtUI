import { Component, Input } from '@angular/core';
import {CommonModule} from "@angular/common";

export type PageToolbarActionItemMeta = {
  type? : 'button' | 'checkbox' | 'upload' | 'spacer' ;
  iconName? : string ;
  name? : string ;
  style? : 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' ;
  action? : (()=>void) | ((flag:boolean)=>void) ;
  data? : any ;
}

@Component({
  selector: 'page-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-toolbar.component.html',
  styleUrl: './page-toolbar.component.css'
})
export class PageToolbarComponent {

  @Input( "title" )
  title:string = "" ;

  @Input( "meta" )
  itemsMeta:PageToolbarActionItemMeta[] = [] ;

  getType( meta:PageToolbarActionItemMeta ) {
    return meta.type ?? 'button' ;
  }

  isButton( meta:PageToolbarActionItemMeta ) : boolean {
    return this.getType( meta ) === 'button' ;
  }

  isCheckbox( meta:PageToolbarActionItemMeta ) : boolean {
    return this.getType( meta ) === 'checkbox' ;
  }

  isSpacer( meta:PageToolbarActionItemMeta ) : boolean {
    return this.getType( meta ) === 'spacer' ;
  }

  isFileUpload( meta:PageToolbarActionItemMeta ) : boolean {
    return this.getType( meta ) === 'upload' ;
  }

  buttonClicked( actionMeta:PageToolbarActionItemMeta ) {
    if( actionMeta.action != undefined ) {
      // @ts-ignore
      actionMeta.action() ;
    }
  }

  checkboxClicked( actionMeta:PageToolbarActionItemMeta, event:any ) {
    if( actionMeta.action != undefined ) {
      actionMeta.action( event.currentTarget.checked ) ;
    }
  }

  fileUploadClicked( actionMeta:PageToolbarActionItemMeta ) {

    const accept:string = actionMeta.data.accept??null ;
    const uploadUrl:string = actionMeta.data.url ;
    const multiple:boolean = actionMeta.data.multiple??false ;

    console.log( 'Uploading file.' ) ;
    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = multiple ;
    if( accept != null ) {
      input.accept = '.txt'
    }

    input.addEventListener( 'change', function( e:Event ){
      console.log( "Got the click event" ) ;
      console.log( (e.target as HTMLInputElement).files ) ;
    } ) ;

    input.click();

  }
}
