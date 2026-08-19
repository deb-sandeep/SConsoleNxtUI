import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { TagAssociationRes, TaggableItemType, TagSO } from "@jee-common/util/tag-data-types";
import { environment } from "@env/environment";

@Injectable()
export class TagAssociationApiService extends RemoteService {

  constructor() {
    super();
  }

  // No modalWait — called per-item in a possibly-multi-item fan-out; a
  // spinner flickering per call would be jarring, and the caller drives its
  // own busy state around the whole batch if needed.
  public addTag( itemType:TaggableItemType, itemId:number, tagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}/${tagId}` ;
    return this.postPromise( url, {}, false ) ;
  }

  public removeTag( itemType:TaggableItemType, itemId:number, tagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}/${tagId}` ;
    return this.deletePromise( url, false ) ;
  }

  public getTagsForItem( itemType:TaggableItemType, itemId:number ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}` ;
    return this.getPromise( url, true ) ;
  }

  // Not called by tag-association-dialog — kept for API completeness since
  // this is a shared service.
  public removeAllTags( itemType:TaggableItemType, itemId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}` ;
    return this.deletePromise( url, true ) ;
  }

  // Not called by tag-association-dialog, which does incremental attach/detach
  // rather than a batch reconcile — kept for API completeness.
  public setTags( itemType:TaggableItemType, itemId:number, tagIds:number[] ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/TagAssociation/${itemType}/${itemId}/Set` ;
    return this.postPromise( url, { tagIds }, true ) ;
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
    return this.getPromise( url, true ) ;
  }
}
