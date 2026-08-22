import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService, DurationPipe, Alert, CloseableBadgeComponent, LocalStorageService } from "lib-core";
import { FormsModule } from "@angular/forms";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { NgClass, NgIf } from "@angular/common";
import { AttemptHistoryComponent } from "@jee-common/widgets/attempt-history/attempt-history.component";
import { ProblemApiService } from "@jee-common/services/problem-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { TagAssociationTarget, TagSO } from "@jee-common/util/tag-data-types";
import { TagAssociationDialogComponent } from "@jee-common/widgets/tag-association-dialog/tag-association-dialog.component";
import { TagIconWidgetComponent } from "@jee-common/widgets/tag-icon-widget/tag-icon-widget.component";
import { StorageKey } from "@jee-common/util/storage-keys";
import { Syllabus } from "./entities/syllabus";
import AlertService = Alert.AlertService;
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

class Exercise {

  problems: TopicProblemSO[] = [] ;
  collapsed = true;

  constructor( public exerciseName: string ) {}

  addProblem( problem: TopicProblemSO ) {
    problem.selected = false ;
    this.problems.push( problem ) ;
    if( problem.problemState !== 'Assigned' ) {
      this.collapsed = false ;
    }
  }
}

class BookChapter {

  exerciseProblems: Record<string, Exercise> = {} ;
  collapsed = false ;

  constructor( public bookChapterName: string ) {}

  addProblem( problem: TopicProblemSO ) {

    let exerciseName = this.getExerciseName( problem ) ;
    let exercise = this.exerciseProblems[ exerciseName ] ;

    if( !exercise ) {
      exercise = new Exercise( exerciseName ) ;
      this.exerciseProblems[ exerciseName ] = exercise ;
    }
    exercise.addProblem( problem ) ;
  }

  private getExerciseName( problem: TopicProblemSO ) {
    return problem.exerciseNum + ". " + problem.exerciseName ;
  }

  expandAll() {
    Object.values( this.exerciseProblems ).forEach( ex => {
      ex.collapsed = false ;
    }) ;
    this.collapsed = false ;
  }

  collapseAll() {
    Object.values( this.exerciseProblems ).forEach( ex => {
      ex.collapsed = true ;
    }) ;
    this.collapsed = true ;
  }
}

@Component({
  selector: 'problem-history',
  imports: [
    AlertsDisplayComponent,
    PageTitleComponent,
    FormsModule,
    NgClass,
    DurationPipe,
    NgIf,
    AttemptHistoryComponent,
    NgbTooltipModule,
    TagAssociationDialogComponent,
    TagIconWidgetComponent,
    CloseableBadgeComponent,
  ],
  templateUrl: './problem-history.component.html',
  styleUrl: './problem-history.component.css'
})
export class ProblemHistoryComponent implements OnDestroy {

  private static readonly TAG_SCROLL_EDGE_PX = 24 ;
  private static readonly TAG_SCROLL_STEP_PX = 8 ;

  private tagWrapScrollTimer: ReturnType<typeof setInterval> | null = null ;

  private titleSvc: PageTitleService = inject( PageTitleService ) ;
  private alertSvc:AlertService = inject( AlertService ) ;
  private tagApiSvc: TagApiService = inject( TagApiService ) ;
  private tagAssociationApiSvc: TagAssociationApiService = inject( TagAssociationApiService ) ;
  private lsSvc: LocalStorageService = inject( LocalStorageService ) ;

  protected readonly Object = Object;
  protected readonly SConsoleUtil = SConsoleUtil;

  protected probApiSvc: ProblemApiService = inject( ProblemApiService ) ;
  protected sylApiSvc: SyllabusApiService = inject( SyllabusApiService ) ;

  @ViewChild( "attemptHistory" )
  private attemptHistory: AttemptHistoryComponent ;

  syllabusMap:Record<string, Syllabus> = {} ;

  selectedSyllabusName = 'IIT Physics' ;
  selectedTopicId = 109 ;
  allProblems: TopicProblemSO[] = [] ;
  problemTagsMap: Record<number, TagSO[]> | null = null ;
  topicTags: TagSO[] = [] ;
  selectedTagFilterIds: Set<number> = new Set() ;

  filteredProblems: Record<string, BookChapter> = {}
  selectedProblem: TopicProblemSO | null = null ;
  showOnlyStarred = false ;
  visibilityChoice = "incomplete" ;

  tagDialogShow = false ;
  tagDialogTargets: TagAssociationTarget[] = [] ;
  tagDialogTopicId: number | undefined = undefined ;

  tagFilterShow = true ;

  constructor() {
    this.titleSvc.setTitle( "Explore problem history" ) ;

    let lastTopicRaw = this.lsSvc.getItem( StorageKey.LAST_PROBLEM_HISTORY_TOPIC ) ;
    if( lastTopicRaw != null ) {
      let lastTopic = JSON.parse( lastTopicRaw ) as { syllabusName: string, topicId: number } ;
      this.selectedSyllabusName = lastTopic.syllabusName ;
      this.selectedTopicId = lastTopic.topicId ;
    }

    this.fetchSyllabusAndTopics()
        .then( () => this.topicSelected() ) ;
  }

  ngOnDestroy() {
    this.stopTagWrapAutoScroll() ;
  }

  onTagWrapMouseMove( event: MouseEvent ) {
    let el = event.currentTarget as HTMLElement ;
    let rect = el.getBoundingClientRect() ;
    let x = event.clientX - rect.left ;

    let dir = 0 ;
    if( x < ProblemHistoryComponent.TAG_SCROLL_EDGE_PX ) dir = -1 ;
    else if( x > rect.width - ProblemHistoryComponent.TAG_SCROLL_EDGE_PX ) dir = 1 ;

    this.stopTagWrapAutoScroll() ;
    if( dir !== 0 ) {
      this.tagWrapScrollTimer = setInterval( () => {
        el.scrollLeft += dir * ProblemHistoryComponent.TAG_SCROLL_STEP_PX ;
      }, 75 ) ;
    }
  }

  stopTagWrapAutoScroll() {
    if( this.tagWrapScrollTimer ) {
      clearInterval( this.tagWrapScrollTimer ) ;
      this.tagWrapScrollTimer = null ;
    }
  }

  private async fetchSyllabusAndTopics() {
    try {
      let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
      syllabusSOList.forEach( so => {
        this.syllabusMap[so.syllabusName] = new Syllabus( so )
      } ) ;
    }
    catch( error ) { this.alertSvc.error( 'Error : ' + error ) ; }
  }

  syllabusSelected() {
    this.selectedTopicId = -1 ;
    this.filteredProblems = {} ;
    this.selectedProblem = null ;
  }

  async topicSelected() {
    this.selectedProblem = null ;
    this.problemTagsMap = null ;
    this.selectedTagFilterIds = new Set() ;

    this.lsSvc.setItem( StorageKey.LAST_PROBLEM_HISTORY_TOPIC, JSON.stringify( {
      syllabusName: this.selectedSyllabusName,
      topicId: this.selectedTopicId,
    } ) ) ;

    this.allProblems = await this.probApiSvc.getProblems( this.selectedTopicId ) ;
    this.computeDisplayProblems() ;
    await Promise.all( [ this.refreshProblemTags(), this.refreshTopicTags() ] ) ;
  }

  private async refreshProblemTags() {
    this.problemTagsMap = await this.tagAssociationApiSvc.getTagsForItems(
      'PROBLEM',
      this.allProblems.map( p => p.problemId )
    ) ;
  }

  private async refreshTopicTags() {
    this.topicTags = ( await this.tagApiSvc.getTagsForTopic( this.selectedTopicId ) )
        .sort( ( a, b ) => a.tagText.localeCompare( b.tagText ) ) ;
  }

  openTagDialog( p: TopicProblemSO ) {
    this.tagDialogTargets = [ {
      itemType: 'PROBLEM',
      itemId: p.problemId,
      displayLabel: p.problemKey.replaceAll( '/', ' / ' ),
    } ] ;
    this.tagDialogTopicId = p.topicId ;
    this.tagDialogShow = true ;
  }

  closeTagDialog() {
    this.tagDialogShow = false ;
  }

  onTagsChanged() {
    this.refreshProblemTags().then() ;
    this.refreshTopicTags().then() ;
    this.attemptHistory.refreshProblemTags() ;
  }

  async removeTag( problem: TopicProblemSO, tag: TagSO ) {
    await this.tagAssociationApiSvc.removeTag( 'PROBLEM', problem.problemId, tag.id ) ;
    this.onTagsChanged() ;
  }

  quickTagPickerProblem: TopicProblemSO | null = null ;
  quickTagPickerPos = { top: 0, left: 0 } ;

  openQuickTagPicker( p: TopicProblemSO, event: MouseEvent ) {
    event.stopPropagation() ;
    let rect = ( event.currentTarget as HTMLElement ).getBoundingClientRect() ;
    this.quickTagPickerPos = { top: rect.bottom, left: rect.left } ;
    this.quickTagPickerProblem = p ;
  }

  closeQuickTagPicker() {
    this.quickTagPickerProblem = null ;
  }

  isProblemTagged( p: TopicProblemSO, tag: TagSO ) {
    return !!this.problemTagsMap?.[ p.problemId ]?.some( t => t.id === tag.id ) ;
  }

  async toggleProblemTag( p: TopicProblemSO, tag: TagSO ) {
    if( this.isProblemTagged( p, tag ) ) {
      await this.tagAssociationApiSvc.removeTag( 'PROBLEM', p.problemId, tag.id ) ;
    }
    else {
      await this.tagAssociationApiSvc.addTag( 'PROBLEM', [ p.problemId ], tag.id ) ;
    }
    this.onTagsChanged() ;
  }

  private computeDisplayProblems() {

    this.filteredProblems = {} ;
    this.allProblems.forEach( problem => {

      if( this.isDisplayable( problem ) ) {
        let bookChName = this.getBookChapterName( problem ) ;
        let bookChapter = this.filteredProblems[ bookChName ] ;

        if( !bookChapter ) {
          bookChapter = new BookChapter( bookChName ) ;
          this.filteredProblems[ bookChName ] = bookChapter ;
        }
        bookChapter.addProblem( problem ) ;
      }
    })
  }

  private isDisplayable( problem: TopicProblemSO ) {
    return true ;
  }

  private getBookChapterName( problem: TopicProblemSO ) {
    return "[" + problem.bookShortName + "] " + problem.chapterNum + ". " + problem.chapterName ;
  }

  getProblemRowClass( problem: TopicProblemSO ) {
    let classNames = [] ;
    switch( problem.problemState ) {
      case 'Assigned'         : classNames.push( 'problem-assigned'         ) ; break ;
      case 'Correct'          : classNames.push( 'problem-correct'          ) ; break ;
      case 'Incorrect'        : classNames.push( 'problem-incorrect'        ) ; break ;
      case 'Redo'             : classNames.push( 'problem-redo'             ) ; break ;
      case 'Later'            : classNames.push( 'problem-later'            ) ; break ;
      case 'Purge'            : classNames.push( 'problem-purge'            ) ; break ;
      case 'Pigeon'           : classNames.push( 'problem-pigeon'           ) ; break ;
      case 'Pigeon Explained' : classNames.push( 'problem-pigeon-explained' ) ; break ;
      case 'Pigeon Solved'    : classNames.push( 'problem-pigeon-solved'    ) ; break ;
    }

    if( this.selectedProblem == problem ) {
      classNames.push( 'problem-selected' ) ;
    }
    return classNames.join( ' ' ) ;
  }

  getDifficultyLevelIcon( problem: TopicProblemSO ) {
    let classNames = [] ;
    if( problem.difficultyLevel > 0 ) {
      classNames.push( 'bi-star-fill' );
      if( problem.difficultyLevel < 4 ) {
        classNames.push( 'problem-difficulty-medium' ) ;
      }
      else if( problem.difficultyLevel < 8 ) {
        classNames.push( 'problem-difficulty-high' ) ;
      }
      else {
        classNames.push( 'problem-difficulty-exceptional' ) ;
      }
    }
    return classNames.join( ' ' ) ;
  }

  expandAll() {
    Object.values( this.filteredProblems ).forEach( bookCh => {
      bookCh.expandAll() ;
    }) ;
  }

  collapseAll() {
    Object.values( this.filteredProblems ).forEach( bookCh => {
      bookCh.collapseAll() ;
    }) ;
  }

  async problemSelected( problem: TopicProblemSO ) {
    this.selectedProblem = problem ;
  }

  async changeProblemState( problem:TopicProblemSO, targetState: string ) {
    await this.probApiSvc.changeProblemState(
      [problem.problemId],
      problem.topicId,
      targetState
    ) ;
    problem.problemState = targetState ;
    if( problem == this.selectedProblem ) {
      this.attemptHistory.refreshProblemAttempts() ;
    }
  }

  async refreshSelectedProblem() {
    let topicProblem = await this.probApiSvc.getProblem( this.selectedProblem!.problemId ) ;
    this.selectedProblem!.problemState = topicProblem.problemState ;
    this.selectedProblem!.numAttempts = topicProblem.numAttempts ;
    this.selectedProblem!.totalDuration = topicProblem.totalDuration ;
  }

  openTagDialogForSelectedProblems() {

    let selectedProblems = this.getSelectedProblems() ;
    if( selectedProblems.length > 0 ) {
      this.tagDialogTargets = selectedProblems.map( p => ( {
        itemType: 'PROBLEM',
        itemId: p.problemId,
        displayLabel: p.problemKey.replaceAll( '/', ' / ' ),
      } ) ) ;
      this.tagDialogTopicId = this.selectedTopicId ;
      this.tagDialogShow = true ;
    }
  }

  public async clearTagsForSelectedProblems() {
    let selectedProblems = this.getSelectedProblems() ;
    if( selectedProblems.length > 0 ) {
      let confirmed = window.confirm(
        `Remove all tags from ${selectedProblems.length} selected problem(s)?`
      ) ;
      if( !confirmed ) return ;

      await this.tagAssociationApiSvc.removeAllTags(
        'PROBLEM',
        selectedProblems.map( p => p.problemId )
      ) ;
      await this.refreshProblemTags() ;
    }
  }

  async changeProblemStateForSelectedProblems( targetState:string ) {

    let problemIds:number[] = [] ;
    let selectedProblems = this.getSelectedProblems() ;

    if( selectedProblems.length > 0 ) {
      selectedProblems.forEach( problem => {
        if( problem.selected ) {
          problemIds.push( problem.problemId ) ;
        }
      }) ;

      await this.probApiSvc.changeProblemState(
        problemIds,
        this.selectedTopicId,
        targetState
      ) ;

      selectedProblems.forEach( problem => {
        problem.problemState = targetState ;
        if( problem == this.selectedProblem ) {
          this.attemptHistory.refreshProblemAttempts() ;
        }
      }) ;
    }
  }

  deselectAllProblems() {
    this.getSelectedProblems().forEach( p => p.selected = false ) ;
  }

  private getSelectedProblems():TopicProblemSO[] {
    let selectedProblems: TopicProblemSO[] = [];
    this.allProblems.forEach( problem => {
      if( problem.selected ) {
        selectedProblems.push( problem ) ;
      }
    }) ;
    return selectedProblems ;
  }

  public isProblemRowVisible( p:TopicProblemSO ) {
    return this.isBaseVisible( p ) && this.matchesTagFilter( p ) ;
  }

  private matchesTagFilter( p:TopicProblemSO ) {
    if( this.selectedTagFilterIds.size === 0 ) return true ;
    let tags = this.problemTagsMap?.[ p.problemId ] ;
    return !!tags && tags.some( t => this.selectedTagFilterIds.has( t.id ) ) ;
  }

  isTagFilterHighlighted( tag:TagSO ) {
    return this.allProblems.some( p =>
      this.isBaseVisible( p ) &&
      this.problemTagsMap?.[ p.problemId ]?.some( t => t.id === tag.id )
    ) ;
  }

  toggleTagFilter( tag:TagSO ) {
    if( this.selectedTagFilterIds.has( tag.id ) ) this.selectedTagFilterIds.delete( tag.id ) ;
    else this.selectedTagFilterIds.add( tag.id ) ;
  }

  private isBaseVisible( p:TopicProblemSO ) {
    let visible = true ;
    if( this.visibilityChoice != "all" ) {
      if( this.visibilityChoice === "completed" ) {
        visible = ( p.problemState === "Correct" ||
                    p.problemState === "Incorrect" ||
                    p.problemState === "Pigeon Explained" ||
                    p.problemState === "Pigeon Solved" ||
                    p.problemState === "Purge" ) ;
      }
      else if( this.visibilityChoice === "incomplete" ) {
        visible = ( p.problemState === "Assigned" ||
                    p.problemState === "Later" ||
                    p.problemState === "Pigeon" ||
                    p.problemState === "Reassign" ||
                    p.problemState === "Redo" ) ;
      }
      else if( this.visibilityChoice === "assigned" ) {
        visible = p.problemState === "Assigned" ;
      }
      else if( this.visibilityChoice === "correct" ) {
        visible = p.problemState === "Correct" ;
      }
      else if( this.visibilityChoice === "incorrect" ) {
        visible = p.problemState === "Incorrect" ;
      }
      else if( this.visibilityChoice === "later" ) {
        visible = p.problemState === "Later" ;
      }
      else if( this.visibilityChoice === "pigeon" ) {
        visible = ( p.problemState === "Pigeon" ||
                    p.problemState === "Pigeon Explained" ||
                    p.problemState === "Pigeon Solved" ) ;
      }
      else if( this.visibilityChoice === "purge" ) {
        visible = p.problemState === "Purge" ;
      }
      else if( this.visibilityChoice === "reassign" ) {
        visible = p.problemState === "Reassign" ;
      }
      else if( this.visibilityChoice === "redo" ) {
        visible = p.problemState === "Redo" ;
      }
    }

    if( visible ) {
      if( this.showOnlyStarred && p.difficultyLevel == 0 ) {
        visible = false ;
      }
    }
    return visible ;
  }

  getProblemStateDisplayText( text: string ) {
    if( text == 'Pigeon Explained' ) {
      return "P Explained" ;
    }
    else if( text == "Pigeon Solved" ) {
      return "P Solved" ;
    }
    return text ;
  }

  toggleTagFilterSelector() {
    this.tagFilterShow = !this.tagFilterShow ;
  }
}
