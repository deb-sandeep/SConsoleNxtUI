import { Component, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { CloseableBadgeComponent, ModalDialogComponent } from "lib-core";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO } from "@jee-common/util/master-data-types";
import { normalizeTagText, TagAssociationTarget, TagSO } from "@jee-common/util/tag-data-types";
import { TagSearchBoxComponent } from "@jee-common/widgets/tag-association-dialog/tag-search-box/tag-search-box.component";
import {
  CreateTagPanelComponent,
  TopicOption
} from "@jee-common/widgets/tag-association-dialog/create-tag-panel/create-tag-panel.component";
import {
  QuickAccessTabsComponent
} from "@jee-common/widgets/tag-association-dialog/quick-access-tabs/quick-access-tabs.component";
import {
  BrowseByTopicComponent
} from "@jee-common/widgets/tag-association-dialog/browse-by-topic/browse-by-topic.component";

@Component({
  selector: 'tag-association-dialog',
  imports: [
    ModalDialogComponent,
    CloseableBadgeComponent,
    TagSearchBoxComponent,
    CreateTagPanelComponent,
    QuickAccessTabsComponent,
    BrowseByTopicComponent,
  ],
  providers: [ TagApiService, TagAssociationApiService, SyllabusApiService ],
  templateUrl: './tag-association-dialog.component.html',
  styleUrl: './tag-association-dialog.component.css',
})
export class TagAssociationDialogComponent implements OnChanges {

  private tagApi = inject( TagApiService ) ;
  private tagAssociationApi = inject( TagAssociationApiService ) ;
  private syllabusApi = inject( SyllabusApiService ) ;

  show = input.required<boolean>() ;
  targets = input.required<TagAssociationTarget[]>() ;
  defaultTopicId = input<number | undefined>() ;

  closed = output<void>() ;
  tagsChanged = output<void>() ;

  attachedTags:TagSO[] = [] ;
  syllabus:SyllabusSO[] = [] ;
  recentTags:TagSO[] = [] ;
  mostUsedTags:TagSO[] = [] ;

  createPanelOpen = false ;
  createPanelQuery = "" ;
  createError:string | null = null ;
  lastAttachWarning:string | null = null ;

  ngOnChanges( changes:SimpleChanges ) {
    if( changes['show'] && this.show() ) {
      this.onOpen() ;
    }
  }

  isSingleMode():boolean { return this.targets().length === 1 ; }
  problemCount():number { return this.targets().filter( t => t.itemType === 'PROBLEM' ).length ; }
  questionCount():number { return this.targets().filter( t => t.itemType === 'QUESTION' ).length ; }

  dialogTitle():string {
    return this.isSingleMode() ? this.targets()[0].displayLabel : `${this.targets().length} items selected` ;
  }

  attachedTagIds():Set<number> {
    return new Set( this.attachedTags.map( t => t.id ) ) ;
  }

  flattenedTopics():TopicOption[] {
    return this.syllabus.flatMap( s =>
      s.topics.map( t => ( { id: t.id, label: `${s.subjectName} — ${t.topicName}` } ) ) ) ;
  }

  private async onOpen() {
    this.createPanelOpen = false ;
    this.createPanelQuery = "" ;
    this.createError = null ;
    this.lastAttachWarning = null ;
    this.attachedTags = [] ;

    const single = this.isSingleMode() ? this.targets()[0] : null ;

    const [ syllabus, recent, mostUsed, attached ] = await Promise.all( [
      this.syllabusApi.getAllSyllabus(),
      this.tagApi.getRecentTags(),
      this.tagApi.getMostUsedTags(),
      single
        ? this.tagAssociationApi.getTagsForItem( single.itemType, single.itemId )
        : Promise.resolve<TagSO[]>( [] ),
    ] ) ;

    this.syllabus = syllabus ;
    this.recentTags = recent ;
    this.mostUsedTags = mostUsed ;
    this.attachedTags = attached ;
  }

  async attachTag( tag:TagSO ) {
    if( this.attachedTagIds().has( tag.id ) ) return ;

    const results = await Promise.allSettled(
      this.targets().map( t => this.tagAssociationApi.addTag( t.itemType, t.itemId, tag.id ) )
    ) ;
    const realFailures = results.filter( ( r ):r is PromiseRejectedResult =>
      r.status === 'rejected' && !String( r.reason ).includes( 'already associated' ) ) ;

    if( realFailures.length === results.length ) {
      // Every item failed for a real reason — don't show the chip as attached.
      this.lastAttachWarning = `Failed to attach "${tag.tagText}": ${realFailures[0].reason}` ;
      return ;
    }

    this.attachedTags = [ ...this.attachedTags, tag ] ;
    this.tagsChanged.emit() ;
    this.lastAttachWarning = realFailures.length > 0
      ? `"${tag.tagText}" could not be applied to ${realFailures.length} of ${results.length} item(s).`
      : null ;
  }

  async detachTag( tag:TagSO ) {
    await Promise.all(
      this.targets().map( t => this.tagAssociationApi.removeTag( t.itemType, t.itemId, tag.id ) )
    ) ;
    this.attachedTags = this.attachedTags.filter( t => t.id !== tag.id ) ;
    this.tagsChanged.emit() ;
  }

  onCreateRequested( req:{ query:string, forced:boolean } ) {
    this.createPanelQuery = req.query ;
    this.createError = null ;
    this.createPanelOpen = true ;
  }

  onSearchEscape() {
    if( this.createPanelOpen ) this.onCreateCancel() ;
  }

  onCreateCancel() {
    this.createPanelOpen = false ;
    this.createError = null ;
  }

  // Primary defense against duplicate-tag creation — see plan notes on the
  // RemoteService HTTP-400 message-loss gap for why this check happens here
  // rather than being trusted to the createTag() rejection alone.
  private async checkDuplicateBeforeCreate( tagText:string ):Promise<boolean> {
    const hits = await this.tagApi.searchTags( tagText ) ;
    const dupe = hits.find( t => normalizeTagText( t.tagText ) === normalizeTagText( tagText ) ) ;
    if( dupe ) {
      this.createError = `A tag matching "${dupe.tagText}" already exists — pick it from the list instead of creating a new one.` ;
      return true ;
    }
    return false ;
  }

  async onCreateAndAttach( req:{ tagText:string, topicId:number } ) {
    if( await this.checkDuplicateBeforeCreate( req.tagText ) ) return ;
    try {
      const tag = await this.tagApi.createTag( req.tagText, req.topicId ) ;
      this.createPanelOpen = false ;
      await this.attachTag( tag ) ;
    }
    catch( err ) {
      this.createError = String( err ) ;
    }
  }

  async onCreateOnly( req:{ tagText:string, topicId:number } ) {
    if( await this.checkDuplicateBeforeCreate( req.tagText ) ) return ;
    try {
      await this.tagApi.createTag( req.tagText, req.topicId ) ;
      this.createPanelOpen = false ;
    }
    catch( err ) {
      this.createError = String( err ) ;
    }
  }

  close() {
    this.closed.emit() ;
  }
}
