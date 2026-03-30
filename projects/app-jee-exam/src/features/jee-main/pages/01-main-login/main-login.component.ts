import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CBTLoginPasswordService } from "./authenticator";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { examConfig } from "../../../../exam-config.js";

@Component({
  selector: 'main-login',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './main-login.component.html',
  styleUrl: './main-login.component.css'
})
export class MainLoginComponent {

  @ViewChild( 'userIdInput' )
  private userIdInput?: ElementRef<HTMLInputElement> ;

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute );

  userId:string = "" ;
  password:string = "" ;
  errMsg:string | null = null;

  constructor() {
    if( examConfig.devMode ) {
      this.userId = "13921566" ;
      this.password = "537275" ;
    }
  }

  ngAfterViewInit() {
    this.userIdInput?.nativeElement.focus() ;
  }

  protected credentialFormatInvalid() {
    if( ( this.userId == undefined ) || (this.userId === "" || this.userId.length != 8) ) {
      return true ;
    }
    else if( ( this.password == undefined ) || (this.password === "" || this.password.length != 6) ) {
      return true ;
    }
    return false ;
  }

  protected removeErrorMsg(){
    this.errMsg = null ;
  }

  protected authenticate() {
    let valid = CBTLoginPasswordService.validateLoginPassword( this.userId, this.password ) ;
    if( !valid ) {
      this.errMsg = "Invalid credentials" ;
    }
    else {
      console.log( "Credentials authenticated" ) ;
      this.router.navigate( [ '../welcome-screen' ], { relativeTo: this.route } ).then();
    }
  }
}
