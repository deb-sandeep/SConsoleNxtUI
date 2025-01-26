import { Component, Input, OnChanges } from "@angular/core";
import { NgClass } from "@angular/common";
import { BookValidationResult } from "../../../manage-books.type";
import { BaseRenderer } from "./base-render.component";
import { MsgRenderComponent } from "./message-render.component";

@Component({
  selector: '[book-render]',
  standalone: true,
  imports: [MsgRenderComponent, NgClass],
  styleUrl: '../book-upload-review.component.css',
  template: `
    <tr>
      <td>Subject</td>
      <td> : </td>
      <td [ngClass]="msgClass('subject')">{{ book?.subject }}</td>
      <td>
        <msg-render [msgs]="msgs" key="subject"></msg-render>
      </td>
    </tr>
    <tr>
      <td>Series</td>
      <td> : </td>
      <td [ngClass]="msgClass('series')">{{ book?.series }}</td>
      <td>
        <msg-render [msgs]="msgs" key="series"></msg-render>
      </td>
    </tr>
    <tr>
      <td>Name</td>
      <td> : </td>
      <td [ngClass]="msgClass('name')" style="font-weight: bolder">{{ book?.name }}</td>
      <td>
        <msg-render [msgs]="msgs" key="name"></msg-render>
      </td>
    </tr>
    <tr>
      <td>Author</td>
      <td> : </td>
      <td [ngClass]="msgClass('author')">{{ book?.author }}</td>
      <td>
        <msg-render [msgs]="msgs" key="author"></msg-render>
      </td>
    </tr>
    <tr>
      <td>Short Name</td>
      <td> : </td>
      <td [ngClass]="msgClass('shortName')">{{ book?.shortName }}</td>
      <td>
        <msg-render [msgs]="msgs" key="shortName"></msg-render>
      </td>
    </tr>
  `
})
export class BookRenderComponent extends BaseRenderer implements OnChanges {

  @Input() book: BookValidationResult | null ;

  constructor() {super();}

  ngOnChanges() {
    this.msgs = this.book!.validationMessages ;
  }
}
