import { Component, input, output } from '@angular/core';
import { ModalDialogComponent } from "lib-core";
import { SavedTagQueryVO } from "@jee-common/util/tag-query-types";

// Modeled on app-jee-common's delete-tag-confirm-dialog (same
// show/confirmed/cancelled + <modal-dialog> wrapper shape), not reused
// directly — that component is typed to TagSO and its copy references
// tag-specific concepts (associationCount, "use Merge instead") that don't
// apply to a saved query.
@Component({
  selector: 'delete-saved-query-confirm-dialog',
  imports: [ ModalDialogComponent ],
  templateUrl: './delete-saved-query-confirm-dialog.component.html',
  styleUrl: './delete-saved-query-confirm-dialog.component.css'
})
export class DeleteSavedQueryConfirmDialogComponent {

  show = input.required<boolean>() ;
  query = input<SavedTagQueryVO | null>( null ) ;

  confirmed = output<void>() ;
  cancelled = output<void>() ;
}
