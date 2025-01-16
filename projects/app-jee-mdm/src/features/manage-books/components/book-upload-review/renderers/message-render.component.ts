import { Component, Input } from '@angular/core';
import { ValidationMessages } from "../book-validation-result.type";

@Component({
  selector: 'msg-render',
  standalone: true,
  imports: [],
  styleUrl: '../book-upload-review.component.css',
  template: `
    @if (msgs != null && msgs.messages[key] != null) {
      @for (msg of msgs.messages[key]; track $index) {
        @if (msg.type === 'ERROR') {
          <div style="color:red"><span class="bi-bug"> </span> {{ msg.msg }}</div>
        } @else if (msg.type === 'WARNING') {
          <div style="color:#8f5509"><span class="bi-exclamation-triangle"> </span> {{ msg.msg }}</div>
        } @else if (msg.type === 'INFO') {
          <div style="color:blue"><span class="bi-info-circle"></span> {{ msg.msg }}</div>
        }
      }
    }
  `
})
export class MsgRenderComponent {

  @Input() msgs: ValidationMessages | null ;
  @Input() key: string ;
}

