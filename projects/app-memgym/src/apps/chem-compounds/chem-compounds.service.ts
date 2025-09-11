import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";
import { DownloadService } from "lib-core";

import { environment } from "@env/environment" ;
import { ChemCompound, ChemCompoundType } from "./chem-compounds.entity";


@Injectable()
export class ChemCompoundsService extends RemoteService {

    constructor( private downloadService: DownloadService ) {
        super();
    }

    async getCompound( id: number ): Promise<ChemCompound> {
        const url = `${ environment.apiRoot }/Master/ChemCompound/${id}` ;
        const ccType = await this.getPromise<ChemCompoundType>( url ) ;
        return new ChemCompound( ccType ) ;
    }

    async getAllCompounds(): Promise<ChemCompound[]> {
        const url = `${ environment.apiRoot }/Master/ChemCompound/All`;
        const response = await this.getPromise<ChemCompoundType[]>( url );
        const compounds: ChemCompound[] = [];
        response.forEach( ccType => compounds.push( new ChemCompound( ccType ) ) );
        return compounds;
    }

    async importCompound( importType: string, filterText: string, forceImport: boolean ): Promise<ChemCompound> {
        const url = `${ environment.apiRoot }/Master/ChemCompound/Import`;
        const body = {
            "importType": importType,
            "filterText": filterText,
            "forceImport": forceImport
        };
        const ccType = await this.postPromise<ChemCompoundType>( url, body, true );
        return new ChemCompound( ccType );
    }

    async saveCompound( chem: ChemCompound ) {
        const url = `${ environment.apiRoot }/Master/ChemCompound/Save` ;
        const body = {
            "id" : chem.id,
            "commonName" : chem.commonName,
            "iupacName" : chem.iupacName,
            "compactFormula" : chem.compactFormula
        } ;
        return this.postPromise<ChemCompoundType>( url, body, true ) ;
    }

    async deleteCompound( id: number ) {
        const url = `${ environment.apiRoot }/Master/ChemCompound/${id}` ;
        return this.deletePromise( url ) ;
    }

    async downloadFlashCards( selectedIds: number[] ) {
        const url = `${ environment.apiRoot }/Master/ChemCompound/DownloadCards` ;
        await this.downloadService.postForDownload( url, selectedIds ) ;
    }
}