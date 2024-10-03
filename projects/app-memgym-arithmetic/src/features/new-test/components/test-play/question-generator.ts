import { GameConfig } from "../../new-test.config";
import { Question, Op } from "../../question";

export class QuestionGenerator {

    private opQGens:OpQGen[] = [] ;
    private nextSequenceNum = 1 ;

    constructor( private cfg:GameConfig ) {
        if( cfg.addition.enabled ) {
            this.opQGens.push( new OpQGen( Op.ADD,
                cfg.addition.lhsMin, cfg.addition.lhsMax,
                cfg.addition.rhsMin, cfg.addition.rhsMax ) ) ;
        }
        if( cfg.subtraction.enabled ) {
            this.opQGens.push( new OpQGen( Op.SUB,
                cfg.addition.lhsMin, cfg.addition.lhsMax,
                cfg.addition.rhsMin, cfg.addition.rhsMax ) ) ;
        }
        if( cfg.multiplication.enabled ) {
            this.opQGens.push( new OpQGen( Op.MUL,
                cfg.multiplication.lhsMin, cfg.multiplication.lhsMax,
                cfg.multiplication.rhsMin, cfg.multiplication.rhsMax ) ) ;
        }
        if( cfg.division.enabled ) {
            this.opQGens.push( new OpQGen( Op.DIV,
                cfg.multiplication.lhsMin, cfg.multiplication.lhsMax,
                cfg.multiplication.rhsMin, cfg.multiplication.rhsMax ) ) ;
        }
    }

    getNextQuestion():Question|undefined {
        const randomOpIndex = Math.floor(Math.random() * this.opQGens.length ) ;
        const nextQ = this.opQGens[randomOpIndex].getNextQuestion() ;
        if( nextQ !== undefined ) {
            nextQ.seqNo = this.nextSequenceNum++ ;
        }
        return nextQ ;
    }
}

class OpQGen {

    private generatedQuestions:string[] = [] ;

    constructor( protected op:Op,
                 protected lhsMin:number,
                 protected lhsMax:number,
                 protected rhsMin:number,
                 protected rhsMax:number ) {}

    getNextQuestion():Question|undefined {
        let lhs, rhs, iterNo = 0 ;
        let successfullyGenerated:boolean = false ;

        while( !successfullyGenerated && iterNo < 100 ) {
            lhs = this.getRandomInt( this.lhsMin, this.lhsMax ) ;
            rhs = this.getRandomInt( this.rhsMin, this.rhsMax ) ;

            const key = Math.min( lhs, rhs ) + ":" + Math.max( lhs, rhs ) ;
            if( this.generatedQuestions.indexOf( key ) == -1 ) {
                this.generatedQuestions.push( key ) ;
                successfullyGenerated = true ;
                return new Question( 0, lhs, rhs, this.op ) ;
            }
            iterNo++ ;
        }
        return undefined ;
    }

    private getRandomInt( min:number, max:number ):number {
        return Math.round((Math.random() * (max-min)) + min) ;
    }
}
