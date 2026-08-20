import { Component, inject } from '@angular/core';
import { TagQueryTreeNodeComponent } from "../tag-query-tree-node/tag-query-tree-node.component";
import { TagBrowserFiltersComponent } from "../tag-browser-filters/tag-browser-filters.component";
import { TagPickerPanelComponent } from "../tag-picker-panel/tag-picker-panel.component";
import { TagBrowserService } from "../../tag-browser.service";

// Left-docked floating panel shell: open/close tab, validity badge, hosts
// the tag-query tree editor + optional filters, and the Apply button. The
// "+tag" telescoping tag-picker-panel is rendered here too (always present,
// gated on TagBrowserService.pickerGroupId internally) since it only ever
// opens from within this panel.
@Component({
  selector: 'query-builder-panel',
  imports: [ TagQueryTreeNodeComponent, TagBrowserFiltersComponent, TagPickerPanelComponent ],
  templateUrl: './query-builder-panel.component.html',
  styleUrl: './query-builder-panel.component.css'
})
export class QueryBuilderPanelComponent {
  protected svc = inject( TagBrowserService ) ;
}
