import { inject, Injectable } from '@angular/core';

import { Router } from "@angular/router";
import {
  PauseEnd,
  PauseStart,
  ProblemAttemptEnd,
  ProblemAttemptStart,
  SessionEnd,
  SessionStart
} from "./response-payload.types";
import {
  Pause,
  ProblemAttempt,
  Session
} from "../screens/session-events-screen/session-event.entities";
import { SessionTypeSO, SyllabusSO } from "@jee-common/util/master-data-types";
import { RestApiService } from "./rest-api.service";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/util/storage-keys";
import { ImgColorCSSGen } from "@jee-common/util/img-color-cssgen";

@Injectable()
export class UIHelperService {

  apiSvc: RestApiService = inject( RestApiService ) ;
  storageSvc: LocalStorageService = inject( LocalStorageService ) ;

  syllabusMap: Record<string, SyllabusSO> = {} ;
  sessionTypeMap: Record<string, SessionTypeSO> = {} ;

  private imgFilters:Record<string, string> = {} ;

  constructor() {
    this.init().then( () => {}) ;
  }

  private async init() {
    let syllabuses = await this._loadMasterData( () => this.apiSvc.getAllSyllabus(), StorageKey.SYLLABUSES ) ;
    let sessionTypes = await this._loadMasterData( () => this.apiSvc.getSessionTypes(), StorageKey.SESSION_TYPES ) ;

    syllabuses.forEach( s => {
      this.syllabusMap[ s.syllabusName ] = s ;
    }) ;

    sessionTypes.forEach( t => {
      this.sessionTypeMap[ t.sessionType ] = t ;
    }) ;
  }

  private async _loadMasterData<T>( networkFn:()=>Promise<T>, storageKey:string )  {
    let obj:T ;
    const str = this.storageSvc.getItem( storageKey ) ;
    if( str == null ) {
      obj = await networkFn() ;
      this.storageSvc.setItem( storageKey, JSON.stringify( obj ) ) ;
    }
    else {
      obj = JSON.parse( str ) ;
    }
    return obj ;
  }

  getSessionTypeImgName( type: string ) {
    return this.sessionTypeMap[ type ].iconName ;
  }

  getSyllabusImgName( syllabusName: string ) {
    return this.syllabusMap[ syllabusName ].iconName ;
  }

  getSessionTypeCSSImgFilter( sessionType: string ) {
    return this.getCSSImageFilter( this.sessionTypeMap[sessionType].color );
  }

  getSyllabusCSSImgFilter( sessionType: string ) {
    return this.getCSSImageFilter( this.syllabusMap[sessionType].color );
  }

  getSyllabusColor( syllabusName: string ) {
    return this.syllabusMap[ syllabusName ].color ;
  }

  private getCSSImageFilter( targetColor:string ) {
    if( !(targetColor in this.imgFilters) ) {
      let cssGen = new ImgColorCSSGen( targetColor ) ;
      let result:any = cssGen.solve() ;
      // Why save it? Because the css generator is non-deterministic
      this.imgFilters[targetColor] = result.filter + ' opacity(0.6)';
    }
    return this.imgFilters[targetColor] ;
  }
}