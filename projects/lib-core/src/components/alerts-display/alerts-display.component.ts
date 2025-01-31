import { Component, SkipSelf } from '@angular/core';
import { Alert } from "./alert.service";
import { NgIf } from "@angular/common";
import { NgbAlert } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'alerts-display',
    imports: [
        NgIf, NgbAlert
    ],
    providers: [Alert.AlertService],
    styles: `
    .alerts-container {
        background-color: var( --page-title-bgcolor ) ;
        padding: 3px;
    }
  `,
    template: `
    <div *ngIf="alertService.hasAlerts()"
         class="alerts-container">
      @for( alert of alertService.alerts; track alert.id ) {
        <ngb-alert [type]="alert.getNgbType()"
                   (closed)="alertService.removeAlert($index)">
          {{alert.message}}
        </ngb-alert>
      }
    </div>
  `
})
export class AlertsDisplayComponent {
  constructor( @SkipSelf() public alertService:Alert.AlertService ) {}
}
