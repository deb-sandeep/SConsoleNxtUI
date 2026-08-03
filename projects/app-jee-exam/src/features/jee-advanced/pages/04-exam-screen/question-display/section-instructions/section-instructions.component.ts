import { Component, Input, OnChanges } from '@angular/core';
import { ExamSectionSO } from "@jee-common/util/exam-data-types";
import {
  ResolvedInstructions,
  buildInstructionContext,
  deriveSectionOrdinal,
  resolveInstructions
} from "./section-instructions.model";
import { SECTION_INSTRUCTION_TEMPLATES } from "./section-instructions-templates";

@Component({
  selector: 'section-instructions',
  imports: [],
  templateUrl: './section-instructions.component.html',
  styleUrl: './section-instructions.component.css'
})
export class SectionInstructionsComponent implements OnChanges {

  @Input({ required: true }) sectionConfig!: ExamSectionSO ;
  @Input({ required: true }) sections!: ExamSectionSO[] ;

  protected vm: ResolvedInstructions | null = null ;

  ngOnChanges() {
    const tpl = SECTION_INSTRUCTION_TEMPLATES[ this.sectionConfig.problemType ] ;
    if( !tpl ) {
      this.vm = null ;
      return ;
    }
    const ordinal = deriveSectionOrdinal( this.sectionConfig, this.sections ) ;
    const ctx = buildInstructionContext( this.sectionConfig, ordinal ) ;
    this.vm = resolveInstructions( tpl, ctx, Math.abs( this.sectionConfig.wrongPenalty ) ) ;
  }
}
