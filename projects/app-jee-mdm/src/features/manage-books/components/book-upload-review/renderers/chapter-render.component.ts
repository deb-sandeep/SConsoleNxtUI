import { Component, Input, OnChanges } from "@angular/core";
import { NgClass } from "@angular/common";
import { ChapterValidationResult } from "../../../manage-books.type";
import { BaseRenderer } from "./base-render.component";
import { MsgRenderComponent } from "./message-render.component";

@Component({
  selector: '[chapter-render]',
  standalone: true,
  imports: [ MsgRenderComponent, NgClass ],
  styleUrl: '../book-upload-review.component.css',
  template: `
    <tr class="chapter-hdr-row">
      <td>Chapter</td>
      <td> : </td>
      <td [ngClass]="msgClass('title')">{{chapter.title}}</td>
      <td>
        <msg-render [msgs]="msgs" key="title"></msg-render>
      </td>
    </tr>
  `
})
export class ChapterRenderComponent extends BaseRenderer implements OnChanges {

  @Input() chapter: ChapterValidationResult ;

  constructor() {super();}

  ngOnChanges() {
    this.msgs = this.chapter!.validationMessages ;
  }
}

