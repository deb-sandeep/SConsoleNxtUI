import { Component, Input, OnChanges } from "@angular/core";
import { NgClass } from "@angular/common";
import { ExerciseValidationResult } from "../book-validation-result.type";
import { BaseRenderer } from "./base-render.component";
import { MsgRenderComponent } from "./message-render.component";

@Component({
  selector: '[exercise-render]',
  standalone: true,
  imports: [ MsgRenderComponent, NgClass ],
  styleUrl: '../book-upload-review.component.css',
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
export class ExerciseRenderComponent extends BaseRenderer implements OnChanges {

  @Input() exercise: ExerciseValidationResult ;
  @Input() showAll: boolean = false ;

  constructor() {
    super();
  }

  ngOnChanges() {
    this.msgs = this.exercise?.validationMessages ;
  }

  hasMsgsForProblemCluster( problem: string ) {
    return this.msgs != null && this.msgs.messages[problem] != null ;
  }
}

