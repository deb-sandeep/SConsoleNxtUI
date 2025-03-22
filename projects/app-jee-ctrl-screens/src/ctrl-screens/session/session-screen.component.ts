import { Component } from '@angular/core';

@Component({
  selector: 'launchpad',
  imports: [],
  template: `
    <div class="msg-div">
      <h2>A study session is ongoing.<br/><br/>Please operate via the session app screen.</h2>
    </div>
  `,
  styles: `
  .msg-div {
      position: absolute;
      left: 0;
      top: 325px;
      width: 100dvw;  
  }
  h2 {
      text-align: center;
  }
  `
})
export class SessionScreenComponent {
}
