import { Component, Input, inject, TemplateRef } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'test-setup',
    imports: [FormsModule],
    templateUrl: './test-setup.component.html',
    styleUrl: './test-setup.component.css'
})
export class TestSetupComponent {

  private modalService = inject(NgbModal) ;

  configErrorMessages:string[] = [] ;

  @Input( "config" )
  config:any = {} ;

  @Output()
  startGameEvent = new EventEmitter<any>() ;

  startGameBtnClicked( content:TemplateRef<any> ):void {
    this.validateGameConfiguration() ;
    if( this.configErrorMessages.length > 0 ) {
      this.modalService.open( content, { ariaLabelledBy: 'modal-basic-title' } ) ;
    }
    else {
      this.startGameEvent.emit( this.config ) ;
    }
  }

  private validateGameConfiguration() {

    this.configErrorMessages.length = 0 ;

    if( !( this.config.addition.enabled ||
           this.config.subtraction.enabled ||
           this.config.multiplication.enabled ||
           this.config.division.enabled ) ) {
      this.configErrorMessages.push( "At least one of the operations should be enabled." ) ;
    }

    if( (this.config.addition.lhsMin >= this.config.addition.lhsMax) ||
        (this.config.addition.rhsMin >= this.config.addition.rhsMax) ||
        (this.config.multiplication.lhsMin >= this.config.multiplication.lhsMax) ||
        (this.config.multiplication.rhsMin >= this.config.multiplication.rhsMax) ) {
      this.configErrorMessages.push( "Left range min should be less than range max." ) ;
    }

    if( this.config.multiplication.enabled || this.config.division.enabled ) {
      if( this.config.multiplication.lhsMin <= 0 || this.config.multiplication.rhsMin <= 0 ) {
        this.configErrorMessages.push( "Multiplication/Division range min can't be less than zero." ) ;
      }
    }
  }
}
