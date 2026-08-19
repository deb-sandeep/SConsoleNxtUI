import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import { TagSO } from "@jee-common/util/tag-data-types";
import { environment } from "@env/environment";

@Injectable()
export class TagApiService extends RemoteService {

  constructor() {
    super();
  }

  public createTag( tagText:string, topicId:number ):Promise<TagSO> {
    const url:string = `${environment.apiRoot}/Master/Tag` ;
    return this.postPromise( url, { tagText, topicId }, true ) ;
  }

  public getTag( tagId:number ):Promise<TagSO> {
    const url:string = `${environment.apiRoot}/Master/Tag/${tagId}` ;
    return this.getPromise( url, false ) ;
  }

  public getTagsForTopic( topicId:number ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/Tag/Topic/${topicId}` ;
    return this.getPromise( url, false ) ;
  }

  // No modalWait — called on every debounced keystroke, a spinner would be jarring.
  public searchTags( text:string ):Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/Tag/Search?text=${encodeURIComponent( text )}` ;
    return this.getPromise( url, false ) ;
  }

  public getRecentTags():Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/Tag/Recent` ;
    return this.getPromise( url, false ) ;
  }

  public getMostUsedTags():Promise<TagSO[]> {
    const url:string = `${environment.apiRoot}/Master/Tag/MostUsed` ;
    return this.getPromise( url, false ) ;
  }

  public renameTag( tagId:number, newTagText:string ):Promise<TagSO> {
    const url:string = `${environment.apiRoot}/Master/Tag/${tagId}/Rename` ;
    return this.postPromise( url, { newTagText }, false ) ;
  }

  public deleteTag( tagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/Tag/${tagId}` ;
    return this.deletePromise( url, false ) ;
  }

  // Not called by tag-association-dialog (no "move tag to a different topic"
  // affordance in it) — kept for API completeness since this is a shared service.
  public changeTagTopic( tagId:number, newTopicId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/Tag/${tagId}/Topic/${newTopicId}` ;
    return this.postPromise( url, {}, false ) ;
  }

  // Not called by tag-association-dialog (merge UI is out of scope) — kept
  // for API completeness since this is a shared service.
  public mergeTags( sourceTagId:number, targetTagId:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/Master/Tag/${sourceTagId}/MergeInto/${targetTagId}` ;
    return this.postPromise( url, {}, false ) ;
  }
}
