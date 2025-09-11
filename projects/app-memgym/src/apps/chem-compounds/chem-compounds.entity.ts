export type ChemCompoundType = {

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
    cardDownloaded:boolean,
} ;

export class ChemCompound {

    // Attributes derived from ChemCompoundType
    public id: number ;
    public chemSpiderId:number ;
    public commonName:string ;
    public iupacName:string ;
    public smiles:string ;
    public formula:string ;
    public molecularWeight:number ;
    public averageMass:number ;
    public mol2D:string ;
    public mol3D:string ;
    public compactFormula:string ;

    // Attributes used by the application for local needs
    public selected: boolean = false ;
    public visible: boolean = true ;
    public selectedForCardDownload: boolean = false ;

    constructor( ccType?: ChemCompoundType ) {
        if( ccType ) {
            this.id = ccType.id ;
            this.chemSpiderId = ccType.chemSpiderId ;
            this.commonName = ccType.commonName ;
            this.iupacName = ccType.iupacName ;
            this.smiles = ccType.smiles ;
            this.formula = ccType.formula ;
            this.molecularWeight = ccType.molecularWeight ;
            this.averageMass = ccType.averageMass ;
            this.mol2D = ccType.mol2D ;
            this.mol3D = ccType.mol3D ;
            this.compactFormula = ccType.compactFormula ;
            this.selectedForCardDownload = !ccType.cardDownloaded ;
        }
    }

    static fromChemCompound( cc: ChemCompound ) {
        let c = new ChemCompound() ;
        c.id = cc.id ;
        c.chemSpiderId = cc.chemSpiderId ;
        c.commonName = cc.commonName ;
        c.iupacName = cc.iupacName ;
        c.smiles = cc.smiles ;
        c.formula = cc.formula ;
        c.molecularWeight = cc.molecularWeight ;
        c.averageMass = cc.averageMass ;
        c.mol2D = cc.mol2D ;
        c.mol3D = cc.mol3D ;
        c.compactFormula = cc.compactFormula ;
        c.selectedForCardDownload = cc.selectedForCardDownload ;
        return c ;
    }
}