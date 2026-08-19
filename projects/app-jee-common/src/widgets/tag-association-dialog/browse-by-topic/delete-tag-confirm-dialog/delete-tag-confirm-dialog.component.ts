import { Component, input, output } from '@angular/core';
import { ModalDialogComponent } from "lib-core";
import { TagSO } from "@jee-common/util/tag-data-types";

@Component({
  selector: 'delete-tag-confirm-dialog',
  imports: [ ModalDialogComponent ],
  templateUrl: './delete-tag-confirm-dialog.component.html',
  styleUrl: './delete-tag-confirm-dialog.component.css'
})
export class DeleteTagConfirmDialogComponent {

  show = input.required<boolean>() ;
  tag = input<TagSO | null>( null ) ;

  confirmed = output<void>() ;
  cancelled = output<void>() ;
}
