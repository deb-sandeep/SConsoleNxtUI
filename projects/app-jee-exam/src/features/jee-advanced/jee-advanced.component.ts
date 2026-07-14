import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ModalWaitComponent } from "lib-core";

@Component({
  selector: 'jee-advanced',
  imports: [ RouterOutlet, ModalWaitComponent ],
  template: `
    <modal-wait></modal-wait>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class JeeAdvancedComponent {
}
