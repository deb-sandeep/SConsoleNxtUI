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

    constructor( ccType: ChemCompoundType ) ;
    constructor( cc: ChemCompound ) ;

    constructor( ccType?: ChemCompoundType, cc?:ChemCompound ) {
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
        }
        else if( cc ) {
            this.id = cc.id ;
            this.chemSpiderId = cc.chemSpiderId ;
            this.commonName = cc.commonName ;
            this.iupacName = cc.iupacName ;
            this.smiles = cc.smiles ;
            this.formula = cc.formula ;
            this.molecularWeight = cc.molecularWeight ;
            this.averageMass = cc.averageMass ;
            this.mol2D = cc.mol2D ;
            this.mol3D = cc.mol3D ;
            this.compactFormula = cc.compactFormula ;
        }
    }
}