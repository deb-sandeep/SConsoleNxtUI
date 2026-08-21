import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { TagAssociationRes, TaggableItemType, TagSO } from "@jee-common/util/tag-data-types";
import { environment } from "@env/environment";

@Injectable()
export class TagAssociationApiService extends RemoteService {

  constructor() {
    super();
  }

  // No modalWait — one call already covers the whole batch, but the caller
  // may still fire one of these per itemType group in a mixed-type
  // selection, and a spinner flickering per group would be jarring.
  //
  // Bulk endpoint — attaches tagId to every id in itemIds in one call.
  // Duplicates (an id that already has this tag) are silently skipped
  // server-side rather than rejected, so there is no "already associated"
  // failure to handle here — a rejection now always means a real failure.
  public addTag( itemType:TaggableItemType, itemIds:number[], tagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${tagId}` ;
    return this.postPromise( url, { itemIds }, false ) ;
  }

  public removeTag( itemType:TaggableItemType, itemId:number, tagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}/${tagId}` ;
    return this.deletePromise( url, false ) ;
  }

  public getTagsForItem( itemType:TaggableItemType, itemId:number ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}` ;
    return this.getPromise( url, false ) ;
  }

  // Bulk endpoint — one entry per distinct tag found across itemIds, with
  // `associationCount` set to how many of those ids carry that tag (not a
  // global count, unlike the same field on TagApiService.getTagsForTopic).
  // Used to build the bulk-mode tag histogram in tag-association-dialog.
  public getTagAssociationHistogram( itemType:TaggableItemType, itemIds:number[] ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/Histogram` ;
    return this.postPromise( url, { itemIds }, false ) ;
  }

  // Not called by tag-association-dialog — kept for API completeness since
  // this is a shared service.
  //
  // Bulk endpoint — removes every tag from every id in itemIds in one call.
  public removeAllTags( itemType:TaggableItemType, itemIds:number[] ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}` ;
    return this.deletePromise( url, false, { itemIds } ) ;
  }

  // Not called by tag-association-dialog, which does incremental attach/detach
  // rather than a batch reconcile — kept for API completeness.
  public setTags( itemType:TaggableItemType, itemId:number, tagIds:number[] ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}/Set` ;
    return this.postPromise( url, { tagIds }, false ) ;
  }

  // Intended for a future host-list "N tags" badge, not this widget — kept
  // for API completeness.
  public getTagCounts( itemType:TaggableItemType, itemIds:number[] ):Promise<Record<number, number>> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/Counts` ;
    return this.postPromise( url, { itemIds }, false ) ;
  }

  // Backs a "find everything tagged X" browsing feature, not this widget —
  // kept for API completeness.
  public getItemsForTag( tagId:number ):Promise<TagAssociationRes> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/ForTag/${tagId}` ;
    return this.getPromise( url, false ) ;
  }
}
