import { ValidationMessages } from "../../../manage-books.type";

export class BaseRenderer {

  public msgs: ValidationMessages | null ;

  msgClass( key: string ): string {

    let hasErrors = false ;
    let hasWarnings = false ;
    let hasInfo = false ;

    if( this.msgs != null && this.msgs.messages[key] != null ) {
      for( let msg of this.msgs.messages[key] ) {
        if( msg.type === 'ERROR' ) {
          hasErrors = true ;
        }
        else if( msg.type === 'WARNING' ) {
          hasWarnings = true ;
        }
        else if( msg.type === 'INFO' ) {
          hasInfo = true ;
        }
      }
    }

    if( hasErrors )        return 'msg-error' ;
    else if( hasWarnings ) return 'msg-warning' ;
    else if( hasInfo )     return 'msg-info' ;
    return '' ;
  }
}

