import { Component, inject } from '@angular/core';
import { TagBrowserService } from "../../tag-browser.service";
import { syllabusDisplayName } from "../../entities/syllabus-display-name";

// Telescoping "Browse topics" sub-panel — opens to the right of
// query-builder-panel when TagBrowserService.showTopicPicker is set, same
// positioning convention as tag-picker-panel. Unlike the tag picker there's
// no staged-selection concept: every syllabus's topics are laid out as their
// own column so all of them are visible and pickable at once (no tabs
// needed — this panel isn't width-constrained the way the 340px left-docked
// filters accordion is), and each checkbox commits straight to
// TagBrowserService.filters.topicIds via toggleTopic.
@Component({
  selector: 'topic-picker-panel',
  imports: [],
  templateUrl: './topic-picker-panel.component.html',
  styleUrl: './topic-picker-panel.component.css'
})
export class TopicPickerPanelComponent {
  protected svc = inject( TagBrowserService ) ;
  protected readonly syllabusDisplayName = syllabusDisplayName ;
}
