import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment" ;
import { ChemCompound, ChemCompoundType } from "./chem-compounds.entity";


@Injectable()
export class ChemCompoundsService extends RemoteService {

    async getAllCompounds(): Promise<ChemCompound[]> {
        const url = `${ environment.apiRoot }/Master/ChemCompound/All`;
        const response = await this.getPromise<ChemCompoundType[]>( url );
        const compounds: ChemCompound[] = [];
        response.forEach( item => compounds.push( new ChemCompound( item ) ) );
        return compounds;
    }

    async importCompound( importType: string, filterText: string, forceImport: boolean ): Promise<ChemCompound> {
        const url = `${ environment.apiRoot }/Master/ChemCompound/Import`;
        const body = {
            "importType": importType,
            "filterText": filterText,
            "forceImport": forceImport
        };
        const response = await this.postPromise<ChemCompoundType>( url, body, true );
        return new ChemCompound( response );
    }

    async saveChem( chem: ChemCompoundType ) {
        const url = `${ environment.apiRoot }/Master/ChemCompound/Save` ;
        const body = {
            "id" : chem.id,
            "commonName" : chem.commonName,
            "iupacName" : chem.iupacName,
            "compactFormula" : chem.compactFormula
        } ;
        return this.postPromise<ChemCompoundType>( url, body, true ) ;
    }
}