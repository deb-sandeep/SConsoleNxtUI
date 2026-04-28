import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ExamSetupService } from "../exam-setup.service";
import { TopicSO } from "@jee-common/util/master-data-types";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/util/storage-keys";

@Component({
  selector: 'select-topics',
  imports: [
    FormsModule
  ],
  templateUrl: './select-topics.component.html',
  styleUrl: './select-topics.component.css'
})
export class SelectTopicsComponent {

  svc = inject( ExamSetupService ) ;
  router = inject( Router ) ;
  lsSvc = inject( LocalStorageService ) ;

  subjectIndex : number ;
  subjectName : string ;
  allTopics : TopicSO[] ;

  selectedTopics : Record<number, boolean> = {} ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      this.subjectIndex = Number( pm.get( 'subjectIndex' ) ) ;
      if( !isNaN( this.subjectIndex ) ){
        const selectedSubjects = this.svc.setupConfig.selectedSubjects ;
        if( this.subjectIndex < selectedSubjects.length ) {
          this.subjectName = this.svc.setupConfig.selectedSubjects[this.subjectIndex] ;
          this.allTopics = this.svc.syllabusMap[ this.subjectName ]!.topics ;
          this.preselectLastSavedTopics() ;
        }
      }
    })
  }

  private preselectLastSavedTopics() {
    this.selectedTopics = {} ;
    const savedIds = this.readSavedTopicMap()[ this.subjectName ] ;
    if( !savedIds ) return ;
    const validIds = new Set( this.allTopics.map( t => t.id ) ) ;
    for( const id of savedIds ) {
      if( validIds.has( id ) ) this.selectedTopics[ id ] = true ;
    }
  }

  private readSavedTopicMap() : Record<string, number[]> {
    const raw = this.lsSvc.getItem( StorageKey.LAST_SELECTED_EXAM_TOPICS ) ;
    if( !raw ) return {} ;
    try { return JSON.parse( raw ) as Record<string, number[]> ; }
    catch { return {} ; }
  }

  topicSelectionChanged( id: number, event:Event ) {
    this.selectedTopics[ id ]  = ( event.target as HTMLInputElement ).checked ;
  }

  selectAll() {
    for( const topic of this.allTopics ) {
      this.selectedTopics[ topic.id ] = true ;
    }
  }

  unselectAll() {
    this.selectedTopics = {} ;
  }

  anyTopicsSelected() {
    for( let key of Object.keys( this.selectedTopics ) ) {
      if( this.selectedTopics[Number(key)] ) return true ;
    }
    return false ;
  }

  showNextDialog() {
    const topics : TopicSO[] = [] ;
    for( let key of Object.keys( this.selectedTopics ) ) {
      if( this.selectedTopics[Number(key)] ) {
        for( let t of this.allTopics ) {
          if( t.id == Number(key) ) {
            topics.push( t ) ;
          }
        }
      }
    }
    this.svc.setupConfig.examTopics[ this.subjectName ] = topics ;

    const savedMap = this.readSavedTopicMap() ;
    savedMap[ this.subjectName ] = topics.map( t => t.id ) ;
    this.lsSvc.setItem( StorageKey.LAST_SELECTED_EXAM_TOPICS,
                        JSON.stringify( savedMap ) ) ;

    this.svc.incrementCurrentWizardStep() ;

    if( this.subjectIndex == (this.svc.setupConfig.selectedSubjects.length - 1) ){
      this.router.navigateByUrl( "/exam-config/exam-setup/configure-duration" ).then() ;
    }
    else {
      this.router.navigate(['../', this.subjectIndex+1],
                           { relativeTo : this.route} ).then() ;
    }
  }
}
