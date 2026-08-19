import { Component, input, output } from '@angular/core';
import { ModalDialogComponent } from "lib-core";
import { TagSO } from "@jee-common/util/tag-data-types";

@Component({
  selector: 'delete-tag-confirm-dialog',
  imports: [ ModalDialogComponent ],
  templateUrl: './delete-tag-confirm-dialog.component.html',
  styleUrl: './delete-tag-confirm-dialog.component.css'
})
/**
 * Thin wrapper around a second `<modal-dialog>`, nested inside
 * `browse-by-topic`, confirming a tag delete. Purely presentational: it
 * shows the tag's own `associationCount` in the warning text so the user
 * knows how many items will lose this tag, and just forwards confirm/cancel
 * as events — `browse-by-topic` performs the actual delete.
 */
export class DeleteTagConfirmDialogComponent {

  /**
   * Host-controlled visibility — `browse-by-topic` shows this whenever it
   * has a `tagPendingDelete`.
   */
  show = input.required<boolean>() ;
  /**
   * The tag being considered for deletion; null when the dialog is closed.
   * Its `associationCount` is what the warning text displays.
   */
  tag = input<TagSO | null>( null ) ;

  /** Emitted when the user confirms the delete. */
  confirmed = output<void>() ;
  /** Emitted when the user backs out (Cancel, or the modal's own dismiss). */
  cancelled = output<void>() ;
}
