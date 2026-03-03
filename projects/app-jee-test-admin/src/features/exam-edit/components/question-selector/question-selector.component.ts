import { Component, inject, input, output } from '@angular/core';
import { ExamQuestionConfig, ExamSectionConfig, QuestionSO } from "../../../../type";
import { ExamEditService } from "../../exam-edit.service";
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective } from "ngx-drag-drop";

@Component({
  selector: 'div[questionSelector]',
  imports: [DndDraggableDirective, DndDropzoneDirective],
  templateUrl: './question-selector.component.html',
  styleUrl: './question-selector.component.css'
})
export class QuestionSelectorComponent {

  editSvc = inject( ExamEditService ) ;

  sectionCfg = input<ExamSectionConfig>() ;

  showQuestion = output<QuestionSO>() ;
  hideQuestion = output<void>() ;
  
  protected selectQuestion( index: number ) {
    let availableQuestions: QuestionSO[] ;
    let selectedQuestion: QuestionSO;
    let problemType = this.sectionCfg()!.problemType ;

    availableQuestions = this.editSvc.selTopicQuestions[ problemType ] ;
    selectedQuestion = availableQuestions[ index ] ;

    this.sectionCfg()?.questions.push( {
      id: -1,
      sequence: -1,
      questionId: selectedQuestion.id,
      sectionId: this.sectionCfg()!.id,
      question: selectedQuestion
    }) ;
  }

  protected showQuestionInView( q: QuestionSO ) {
    this.showQuestion.emit( q ) ;
  }

  protected removeQuestionFromView() {
    this.hideQuestion.emit() ;
  }

  protected questionAssigned( q: QuestionSO ) {
    for( let question of this.sectionCfg()!.questions ) {
      if( question.question.id == q.id ) {
        return true ;
      }
    }
    return false ;
  }

  protected dropSelectedQuestionBefore( event: DndDropEvent, targetQuestionId: number ) {

    // Each draggable selected row publishes its question id as the drag payload.
    // We read that id back from the drop event so we can locate the dragged item
    // inside sectionCfg().questions without depending on DOM order.
    const draggedQuestionId = event.data as number | undefined ;
    if( draggedQuestionId == null || draggedQuestionId === targetQuestionId ) {
      return ;
    }

    const questions = this.sectionCfg()?.questions ;
    if( !questions ) {
      return ;
    }

    const previousIndex = questions.findIndex( question =>
                                                        question.question.id === draggedQuestionId ) ;
    const targetIndex = questions.findIndex( question =>
                                                      question.question.id === targetQuestionId ) ;

    if( previousIndex < 0 || targetIndex < 0 ) {
      return ;
    }

    // Reordering is done directly on the sectionCfg().questions array because that
    // array is the source of truth for both rendering and persistence.
    // First remove the dragged entry from its old slot, then insert it immediately
    // before the question that received the drop.
    //
    // If the dragged item originally sat above the target, removing it shifts the
    // target one position to the left, so the insertion index must be adjusted by 1.
    const [ movedQuestion ] = questions.splice( previousIndex, 1 ) ;
    const insertIndex = previousIndex < targetIndex ? targetIndex - 1 : targetIndex ;
    questions.splice( insertIndex, 0, movedQuestion ) ;
  }

  protected removeSelectedQuestion( index: number ) {
    this.sectionCfg()?.questions.splice( index, 1 );
  }
}
