import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { TagQueryTreeNodeComponent } from "../tag-query-tree-node/tag-query-tree-node.component";
import { TagBrowserFiltersComponent } from "../tag-browser-filters/tag-browser-filters.component";
import { TagPickerPanelComponent } from "../tag-picker-panel/tag-picker-panel.component";
import { TopicPickerPanelComponent } from "../topic-picker-panel/topic-picker-panel.component";
import { DeleteSavedQueryConfirmDialogComponent } from "../delete-saved-query-confirm-dialog/delete-saved-query-confirm-dialog.component";
import { TagBrowserService } from "../../tag-browser.service";

// Left-docked floating panel shell: open/close tab, validity badge, hosts
// the tag-query tree editor + optional filters, and the Apply button, plus
// the "Saved" queries dropdown in the header. Both telescoping sub-panels —
// "+tag" (tag-picker-panel) and "Browse topics" (topic-picker-panel) — are
// rendered here too (always present, each gated on its own
// TagBrowserService flag internally) since they only ever open from within
// this panel.
@Component({
  selector: 'query-builder-panel',
  imports: [
    FormsModule, TagQueryTreeNodeComponent, TagBrowserFiltersComponent,
    TagPickerPanelComponent, TopicPickerPanelComponent, DeleteSavedQueryConfirmDialogComponent,
  ],
  templateUrl: './query-builder-panel.component.html',
  styleUrl: './query-builder-panel.component.css'
})
export class QueryBuilderPanelComponent {
  protected svc = inject( TagBrowserService ) ;
}
