import { Component, inject } from '@angular/core';
import { TagSearchBoxComponent } from "@jee-common/widgets/tag-association-dialog/tag-search-box/tag-search-box.component";
import { QuickAccessTabsComponent } from "@jee-common/widgets/tag-association-dialog/quick-access-tabs/quick-access-tabs.component";
import { BrowseByTopicComponent } from "@jee-common/widgets/tag-association-dialog/browse-by-topic/browse-by-topic.component";
import { TagBrowserService } from "../../tag-browser.service";

// Telescoping "+tag" sub-panel — opens to the right of query-builder-panel
// when TagBrowserService.pickerGroupId is set. Composes the same picker
// widgets tag-association-dialog uses (tag-search-box, quick-access-tabs,
// browse-by-topic), but every pick here goes into TagBrowserService's
// staged-selection state (toggleStagedTag) instead of committing
// immediately — this panel adds the multi-select-then-confirm flow those
// widgets don't have on their own. allowCreate/allowCatalogEdits are both
// off: inline tag creation and catalog rename/delete don't belong in a
// search context.
@Component({
  selector: 'tag-picker-panel',
  imports: [ TagSearchBoxComponent, QuickAccessTabsComponent, BrowseByTopicComponent ],
  templateUrl: './tag-picker-panel.component.html',
  styleUrl: './tag-picker-panel.component.css'
})
export class TagPickerPanelComponent {
  protected svc = inject( TagBrowserService ) ;
}
