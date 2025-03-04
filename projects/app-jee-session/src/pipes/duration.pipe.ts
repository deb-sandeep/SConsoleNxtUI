import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform( numSeconds: number ): string {

    let hours   = Math.floor( numSeconds / 3600 ) ;
    let minutes = Math.floor( ( numSeconds - (hours * 3600) ) / 60 ) ;
    let seconds = numSeconds - ( hours * 3600 ) - ( minutes * 60 ) ;

    let hrStr, minStr, secStr ;

    hrStr  = ( hours   < 10 ) ? '0' + hours   : '' + hours ;
    minStr = ( minutes < 10 ) ? '0' + minutes : '' + minutes ;
    secStr = ( seconds < 10 ) ? '0' + seconds : '' + seconds ;

    return ((hours > 0)? hrStr + ':' : '') + minStr + ':' + secStr ;
  }
}