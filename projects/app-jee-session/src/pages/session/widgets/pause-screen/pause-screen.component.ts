import { Component, inject } from '@angular/core';
import { DurationPipe } from "lib-core";
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";

@Component({
  selector: 'pause-screen',
  imports: [ DurationPipe ],
  styleUrl: './pause-screen.component.css',
  template: `
    <div id="pause-screen">
      <div id="resume-panel"
           (click)="session.resume()">
        <span [style.color]="'lightgrey'">Paused</span>
        <div id="pause-timer">
          {{session.currentPause!.duration() | duration}}
        </div>
      </div>
    </div>
  `,
})
export class PauseScreenComponent {

  private stateSvc = inject( SessionStateService ) ;
  protected session:Session = this.stateSvc.session ;
}
