import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class TimerService extends BehaviorSubject<number> {

  private tickCounter:number = 0 ;

  constructor() {
    super(0) ;
    setTimeout(() => this.tick(), 1000 ) ;
  }

  private tick(): void {
    super.next( this.tickCounter++ ) ;
    setTimeout(() => this.tick(), 1000 ) ;
  }
}