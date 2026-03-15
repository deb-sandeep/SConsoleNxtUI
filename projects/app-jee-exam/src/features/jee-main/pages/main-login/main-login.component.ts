import { Component, ElementRef, ViewChild } from '@angular/core';
import { CBTLoginPasswordService } from "./authenticator";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";

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

  userId:string ;
  password:string ;
  errMsg:string | null = null;

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
    console.log( "Authentication Component" ) ;
    let valid = CBTLoginPasswordService.validateLoginPassword( this.userId, this.password ) ;
    if( !valid ) {
      this.errMsg = "Invalid credentials" ;
    }
    else {
      // Move to the candidate confirmation page
    }
  }
}
