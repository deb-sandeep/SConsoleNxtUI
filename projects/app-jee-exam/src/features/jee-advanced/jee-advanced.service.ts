import { Injectable } from '@angular/core';
import { JeeBaseService } from "@jee-common/services/jee-base.service";

@Injectable()
export class JeeAdvancedService extends JeeBaseService {

  async loadExamConfig( examId: number ) {
    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;
    this.timeLeftInSeconds.set( this.examConfig.duration ) ;
  }

  getPaperTitle(): string {
    if( !this.examConfig ) {
      return 'JEE Advanced' ;
    }
    const paperText = this.getPaperText( this.examConfig.note ) ;
    return `JEE Advanced ${this.getExamYear()}${ paperText ? ' ' + paperText : '' }` ;
  }

  private getExamYear(): number {
    return new Date() < new Date( 2027, 4, 1 ) ? 2027 : 2028 ;
  }

  private getPaperText( note: string ): string {
    const match = note?.match( /Paper [\d]/ ) ;
    return match ? match[0] : '' ;
  }
}
