import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import {
  SavedTagQueryVO, SaveQueryReq, TagBrowserFilters,
  TagQueryGroupNode, TagQueryGroupNodeWire, TagQueryNode, TagQueryNodeWire,
  TagQuerySearchReq, TagQuerySearchRes
} from "@jee-common/util/tag-query-types";
import { environment } from "@env/environment";

// Backs the tag-browser query builder.
@Injectable()
export class TagQueryApiService extends RemoteService {

  constructor() {
    super();
  }

  public search( tagQuery:TagQueryGroupNode, filters:TagQuerySearchReq['filters'] ):Promise<TagQuerySearchRes> {
    const req:TagQuerySearchReq = {
      tagQuery: stripCollapsed( tagQuery ) as TagQueryGroupNodeWire,
      filters,
    } ;
    const url:string = `${environment.apiRoot}/TagQuery/Search` ;
    return this.postPromise( url, req, true ) ;
  }

  public saveQuery( name:string, tagQuery:TagQueryGroupNode, filters:TagBrowserFilters ):Promise<SavedTagQueryVO> {
    const req:SaveQueryReq = {
      name,
      query: { tagQuery: stripCollapsed( tagQuery ) as TagQueryGroupNodeWire, filters },
    } ;
    const url:string = `${environment.apiRoot}/TagQuery/SaveQuery` ;
    return this.postPromise( url, req, true ) ;
  }

  public getSavedQueries():Promise<SavedTagQueryVO[]> {
    const url:string = `${environment.apiRoot}/TagQuery/SavedQueries` ;
    return this.getPromise( url, false ) ;
  }

  // tagQuery comes back in WIRE form (no 'collapsed') — hydrate it via
  // entities/query-tree.ts's hydrateTree() before assigning into the
  // editable UI tree.
  public getSavedQuery( id:number ):Promise<TagQuerySearchReq> {
    const url:string = `${environment.apiRoot}/TagQuery/SavedQuery/${id}` ;
    return this.getPromise( url, true ) ;
  }

  public deleteSavedQuery( id:number ):Promise<string> {
    const url:string = `${environment.apiRoot}/TagQuery/SavedQuery/${id}` ;
    return this.deletePromise( url, false ) ;
  }
}

// Exported so callers can strip 'collapsed' for structural comparisons too
// (e.g. TagBrowserService's dirty-check against a loaded saved query) —
// collapse state is UI-only and shouldn't count as a real change.
export function stripCollapsed( node:TagQueryNode ):TagQueryNodeWire {
  if( node.type === 'condition' ) return node ;
  const { collapsed, ...rest } = node ;
  return { ...rest, children: node.children.map( stripCollapsed ) } ;
}
