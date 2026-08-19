import { Component, inject, input, OnChanges, output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagSO } from "@jee-common/util/tag-data-types";
import { DeleteTagConfirmDialogComponent } from "./delete-tag-confirm-dialog/delete-tag-confirm-dialog.component";

// The syllabus list can carry non-subject entries (e.g. "Exam", "Reasoning")
// that aren't meaningful homes for a concept tag — only these three are shown.
const ALLOWED_SUBJECTS = [ 'Physics', 'Chemistry', 'Maths' ] ;

@Component({
  selector: 'browse-by-topic',
  imports: [ FormsModule, DeleteTagConfirmDialogComponent ],
  templateUrl: './browse-by-topic.component.html',
  styleUrl: './browse-by-topic.component.css'
})
export class BrowseByTopicComponent implements OnChanges {

  private tagApi = inject( TagApiService ) ;

  syllabus = input<SyllabusSO[]>( [] ) ;
  excludeTagIds = input<Set<number>>( new Set() ) ;
  defaultTopicId = input<number | undefined>() ;

  tagSelected = output<TagSO>() ;

  activeSubject:string | null = null ;
  selectedTopicId:number | null = null ;
  topicFilterQuery = "" ;
  topicTags:TagSO[] = [] ;

  editingTagId:number | null = null ;
  editingText = "" ;
  editError:string | null = null ;

  tagPendingDelete:TagSO | null = null ;

  ngOnChanges() {
    if( this.activeSubject !== null ) return ; // already initialized for this dialog session
    const subjectList = this.visibleSyllabus() ;
    if( subjectList.length === 0 ) return ;

    const defaultSubject = subjectList.find( s =>
      s.topics.some( t => t.id === this.defaultTopicId() ) )?.subjectName ;

    this.activeSubject = defaultSubject ?? subjectList[0].subjectName ;
    const topics = this.subjectTopics() ;
    const initialTopicId = topics.some( t => t.id === this.defaultTopicId() )
      ? this.defaultTopicId()
      : topics[0]?.id ;
    this.selectTopic( initialTopicId ) ;
  }

  visibleSyllabus():SyllabusSO[] {
    return this.syllabus().filter( s => ALLOWED_SUBJECTS.includes( s.subjectName ) ) ;
  }

  subjectTopics():TopicSO[] {
    return this.visibleSyllabus().find( s => s.subjectName === this.activeSubject )?.topics ?? [] ;
  }

  filteredTopics():TopicSO[] {
    const q = this.topicFilterQuery.trim().toLowerCase() ;
    const topics = this.subjectTopics() ;
    if( q.length === 0 ) return topics ;
    return topics.filter( t => t.topicName.toLowerCase().includes( q ) ) ;
  }

  visibleTopicTags():TagSO[] {
    return this.topicTags.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  selectSubject( subjectName:string ) {
    this.activeSubject = subjectName ;
    this.topicFilterQuery = "" ;
    this.selectTopic( this.subjectTopics()[0]?.id ) ;
  }

  selectTopic( topicId:number | null | undefined ) {
    if( topicId == null ) {
      this.selectedTopicId = null ;
      this.topicTags = [] ;
      return ;
    }
    this.selectedTopicId = topicId ;
    this.tagApi.getTagsForTopic( topicId ).then( tags => this.topicTags = tags ) ;
  }

  attach( tag:TagSO ) {
    this.tagSelected.emit( tag ) ;
  }

  startEdit( tag:TagSO ) {
    this.editingTagId = tag.id ;
    this.editingText = tag.tagText ;
    this.editError = null ;
  }

  cancelEdit() {
    this.editingTagId = null ;
    this.editingText = "" ;
  }

  async confirmEdit() {
    const text = this.editingText.trim() ;
    if( text.length === 0 || this.editingTagId == null ) return ;
    const tagId = this.editingTagId ;
    try {
      await this.tagApi.renameTag( tagId, text ) ;
      this.topicTags = this.topicTags.map( t => t.id === tagId ? { ...t, tagText: text } : t ) ;
      this.cancelEdit() ;
    }
    catch( err ) {
      this.editError = String( err ) ;
    }
  }

  requestDelete( tag:TagSO ) {
    this.tagPendingDelete = tag ;
  }

  cancelDelete() {
    this.tagPendingDelete = null ;
  }

  async confirmDelete() {
    const tag = this.tagPendingDelete ;
    if( !tag ) return ;
    await this.tagApi.deleteTag( tag.id ) ;
    this.tagPendingDelete = null ;
    this.topicTags = this.topicTags.filter( t => t.id !== tag.id ) ;
  }
}
