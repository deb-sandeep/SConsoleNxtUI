import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from "lib-core";

import { SessionNetworkService } from "./session-network.service";
import { SessionTypeSO, SyllabusSO } from "@jee-common/master-data-types";
import { StorageKey } from "@jee-common/storage-keys" ;

@Injectable()
export class SessionStateService {

  storageSvc: LocalStorageService = inject( LocalStorageService ) ;
  networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;

  syllabuses: SyllabusSO[] = [];
  sessionTypes: SessionTypeSO[] = [];

  async loadMasterData() {
    this.syllabuses = await this._loadMasterData( () => this.networkSvc.getAllSyllabus(), StorageKey.SYLLABUSES ) ;
    this.sessionTypes = await this._loadMasterData( () => this.networkSvc.getSessionTypes(), StorageKey.SESSION_TYPES ) ;
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
}