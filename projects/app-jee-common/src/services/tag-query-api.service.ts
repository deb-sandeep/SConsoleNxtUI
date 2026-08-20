import { Injectable } from "@angular/core";
import { RemoteService } from "lib-core";
import {
  TagQueryGroupNode, TagQueryGroupNodeWire, TagQueryNode, TagQueryNodeWire,
  TagQuerySearchReq, TagQuerySearchRes
} from "@jee-common/util/tag-query-types";
import { environment } from "@env/environment";

// Backs the tag-browser query builder. NOTE: Master/TagQuery/Search does not
// exist server-side yet — this service defines the wire contract that a
// separate backend task needs to implement (see TagQuerySearchReq/Res).
@Injectable()
export class TagQueryApiService extends RemoteService {

  constructor() {
    super();
  }

  public search( tagQuery:TagQueryGroupNode, filters:TagQuerySearchReq['filters'],
                 problemsPage:number, questionsPage:number, pageSize:number ):Promise<TagQuerySearchRes> {
    const req:TagQuerySearchReq = {
      tagQuery: stripCollapsed( tagQuery ) as TagQueryGroupNodeWire,
      filters, problemsPage, questionsPage, pageSize,
    } ;
    const url:string = `${environment.apiRoot}/Master/TagQuery/Search` ;
    return this.postPromise( url, req, true ) ;
  }
}

function stripCollapsed( node:TagQueryNode ):TagQueryNodeWire {
  if( node.type === 'condition' ) return node ;
  const { collapsed, ...rest } = node ;
  return { ...rest, children: node.children.map( stripCollapsed ) } ;
}
