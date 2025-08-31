export enum Op { ADD='+', SUB='-', MUL='x', DIV='÷' }

export class Question {

    private readonly lhs:number = 0 ;
    private readonly rhs:number = 0 ;
    private readonly answer:number = 0 ;

    public timeTakenMillis:number = 0 ;

    constructor( public seqNo:number,
                 num1:number, num2:number, private op:Op ) {
        switch( op ) {
            case Op.ADD:
                this.lhs = num1 ;
                this.rhs = num2 ;
                this.answer = num1 + num2 ;
                break ;
            case Op.SUB:
                this.lhs = num1 + num2 ;
                this.rhs = num2 ;
                this.answer = num1 ;
                break ;
            case Op.MUL:
                this.lhs = num1 ;
                this.rhs = num2 ;
                this.answer = num1 * num2 ;
                break ;
            case Op.DIV:
                this.lhs = num1 * num2 ;
                this.rhs = num2 ;
                this.answer = num1 ;
                break ;
        }
    }

    stringifyQuestion(): string {
        return this.lhs + ' ' + this.op + ' ' + this.rhs ;
    }

    getAnswer(): number {
        return this.answer ;
    }
}