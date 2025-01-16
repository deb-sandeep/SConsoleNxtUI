import {Component, Input, OnInit} from '@angular/core';
import {
  BookValidationResult,
  ChapterValidationResult,
  ExerciseValidationResult,
  ValidationMessages
} from "../../types/book-validation-result.type";
import {NgClass} from "@angular/common";

// -----------------------------------------------------------------------------------
class BaseRenderer {
  msgs: ValidationMessages | null ;

  msgClass( key: string ): string {
    let hasErrors = false ;
    let hasWarnings = false ;
    let hasInfo = false ;

    if( this.msgs != null && this.msgs.messages[key] != null ) {
      for( let msg of this.msgs.messages[key] ) {
        if( msg.type === 'ERROR' ) {
          hasErrors = true ;
        }
        else if( msg.type === 'WARNING' ) {
          hasWarnings = true ;
        }
        else if( msg.type === 'INFO' ) {
          hasInfo = true ;
        }
      }
    }

    if( hasErrors )        return 'msg-error' ;
    else if( hasWarnings ) return 'msg-warning' ;
    else if( hasInfo )     return 'msg-info' ;
    return '' ;
  }
}

// -----------------------------------------------------------------------------------
@Component({
  selector: 'msg-render',
  standalone: true,
  imports: [],
  styleUrl: './book-upload-review.component.css',
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

// -----------------------------------------------------------------------------------
@Component({
  selector: '[book-render]',
  standalone: true,
  imports: [MsgRenderComponent, NgClass],
  styleUrl: './book-upload-review.component.css',
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
export class BookRenderComponent extends BaseRenderer implements OnInit {

  @Input() book: BookValidationResult | null ;

  constructor() {
    super();
  }

  ngOnInit() {
    this.msgs = this.book!.validationMessages ;
  }
}

// -----------------------------------------------------------------------------------
@Component({
  selector: '[chapter-render]',
  standalone: true,
  imports: [ MsgRenderComponent, NgClass ],
  styleUrl: './book-upload-review.component.css',
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
export class ChapterRenderComponent extends BaseRenderer implements OnInit {

  @Input() chapter: ChapterValidationResult ;

  constructor() {
    super();
  }

  ngOnInit() {
    this.msgs = this.chapter!.validationMessages ;
  }
}

// -----------------------------------------------------------------------------------
@Component({
  selector: '[exercise-render]',
  standalone: true,
  imports: [ MsgRenderComponent, NgClass ],
  styleUrl: './book-upload-review.component.css',
  template: `
    <tr class="exercise-hdr-row">
      <td>Exercise</td>
      <td> : </td>
      <td [ngClass]="msgClass('name')">{{exercise.name}}</td>
      <td>
        <msg-render [msgs]="msgs" key="name"></msg-render>
      </td>
    </tr>
    @for( problem of exercise.problems; track $index ) {
      @if( showAll || hasMsgsForProblemCluster( problem ) ) {
        <tr class="problem-cluster-row">
          <td></td>
          <td></td>
          <td [ngClass]="msgClass(problem)">{{problem}}</td>
          <td>
            <msg-render [msgs]="msgs" [key]="problem"></msg-render>
          </td>
        </tr>
      }
    }
  `
})
export class ExerciseRenderComponent extends BaseRenderer implements OnInit {

  @Input() exercise: ExerciseValidationResult ;
  @Input() showAll: boolean = false ;

  constructor() {
    super();
  }

  ngOnInit() {
    this.msgs = this.exercise!.validationMessages ;
  }

  hasMsgsForProblemCluster( problem: string ) {
    return this.msgs != null && this.msgs.messages[problem] != null ;
  }
}

