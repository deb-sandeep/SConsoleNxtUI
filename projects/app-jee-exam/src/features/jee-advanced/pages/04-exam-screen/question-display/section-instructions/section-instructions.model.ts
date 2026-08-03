import { ExamSectionSO } from "@jee-common/util/exam-data-types";

export type MarkingRowKind = 'full' | 'partial' | 'zero' | 'negative' ;

export interface MarkingSchemeRowTpl {
  kind: MarkingRowKind ;
  label: string ;
  marks: string ;
  condition: string ;
  // Used instead of condition when the section carries a wrong-answer penalty.
  // Lets a zero row say "In all other cases." for penalty-free sections without
  // clashing with the negative row's "In all other cases." when a penalty exists.
  conditionWhenPenalty?: string ;
}

export interface SectionInstructionsTemplate {
  header: string ;
  bullets: string[] ;
  markingIntro: string ;
  markingScheme: MarkingSchemeRowTpl[] ;
  example?: {
    lead: string ;
    lines: string[] ;
  } ;
}

export interface ResolvedMarkingRow {
  kind: MarkingRowKind ;
  label: string ;
  marks: string ;
  conditionHtml: string ;
}

export interface ResolvedInstructions {
  header: string ;
  bulletHtmls: string[] ;
  markingIntroHtml: string ;
  rows: ResolvedMarkingRow[] ;
  exampleLeadHtml?: string ;
  exampleLineHtmls?: string[] ;
}

const NUMBER_WORDS = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'
] ;

// NTA style count rendering, e.g. numberWord(4) => "FOUR (04)"
export function numberWord( n: number ): string {
  const word = NUMBER_WORDS[ n ] ?? String( n ) ;
  return `${ word } (${ String( n ).padStart( 2, '0' ) })` ;
}

export function interpolate( tpl: string,
                             ctx: Record<string, string | number> ): string {
  return tpl.replace( /\{(\w+)\}/g,
      ( match, key ) => key in ctx ? String( ctx[ key ] ) : match ) ;
}

export function buildInstructionContext( section: ExamSectionSO,
                                         sectionOrdinal: number ): Record<string, string | number> {
  const full = section.correctMarks ;
  return {
    sectionOrdinal,
    maxMarks         : section.numCompulsoryQuestions * full,
    numQuestions     : section.numQuestions,
    numQuestionsWord : numberWord( section.numQuestions ),
    // CMT/LCT sections carry two questions per paragraph
    numParagraphsWord: numberWord( Math.max( 1, Math.round( section.numQuestions / 2 ) ) ),
    correctMarks     : full,
    wrongPenalty     : Math.abs( section.wrongPenalty ),
    partialMarks3    : full - 1,
    partialMarks2    : full - 2,
    partialMarks1    : full - 3,
  } ;
}

// The "SECTION n" ordinal restarts for each subject, mirroring the
// "<subject> Sec <n>" tab naming in JeeAdvancedService
export function deriveSectionOrdinal( section: ExamSectionSO,
                                      allSections: ExamSectionSO[] ): number {
  return allSections
      .filter( s => s.syllabusName === section.syllabusName &&
                    s.examSequence <= section.examSequence )
      .length ;
}

export function resolveInstructions( tpl: SectionInstructionsTemplate,
                                     ctx: Record<string, string | number>,
                                     wrongPenaltyAbs: number ): ResolvedInstructions {
  return {
    header          : interpolate( tpl.header, ctx ),
    bulletHtmls     : tpl.bullets.map( b => interpolate( b, ctx ) ),
    markingIntroHtml: interpolate( tpl.markingIntro, ctx ),
    rows            : tpl.markingScheme
        .filter( row => row.kind !== 'negative' || wrongPenaltyAbs !== 0 )
        .map( row => ( {
          kind         : row.kind,
          label        : row.label,
          marks        : interpolate( row.marks, ctx ),
          conditionHtml: interpolate(
              wrongPenaltyAbs !== 0 && row.conditionWhenPenalty ?
                  row.conditionWhenPenalty : row.condition, ctx ),
        } ) ),
    exampleLeadHtml : tpl.example ? interpolate( tpl.example.lead, ctx ) : undefined,
    exampleLineHtmls: tpl.example ? tpl.example.lines.map( l => interpolate( l, ctx ) ) : undefined,
  } ;
}
