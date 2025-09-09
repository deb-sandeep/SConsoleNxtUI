import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment" ;

export type ChemCompound = {
    id: number,
    chemSpiderId:number,
    commonName:string,
    iupacName:string,
    smiles:string,
    formula:string,
    molecularWeight:number,
    averageMass:number,
    mol2D:string,
    mol3D:string,
    compactFormula:string,
} ;

@Injectable()
export class ChemCompoundsService extends RemoteService {

    importCompound( importType:string, filterText:string, forceImport:boolean ) : Promise<ChemCompound> {
        const url = `${environment.apiRoot}/Master/ChemCompound/Import` ;
        const body = {
            "importType" : importType,
            "filterText" : filterText,
            "forceImport" : forceImport
        } ;
        return this.postPromise<ChemCompound>( url, body, true ) ;
    }
}