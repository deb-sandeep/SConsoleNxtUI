import { ExamAttemptSO, QuestionImageSO } from "@jee-common/util/exam-data-types" ;
import { environment } from "@env/environment" ;

export interface QPQuestion {
  number   : number ;
  sourceId : string ;
  images   : QuestionImageSO[] ;
}

export interface QPSection {
  title     : string ;
  questions : QPQuestion[] ;
}

export function buildQPSections( attempt: ExamAttemptSO ): QPSection[] {
  let qNum = 1 ;
  return attempt.sectionAttempts.map( sa => ({
    title: sa.examSection.syllabusName.substring( 4 ) + ' : ' + sa.examSection.problemType,
    questions: [ ...sa.questionAttempts ]
      .sort( ( a, b ) => a.examQuestion.sequence - b.examQuestion.sequence )
      .map( qa => ({
        number   : qNum++,
        sourceId : qa.examQuestion.question.sourceId,
        images   : [ ...qa.examQuestion.question.questionImages ]
                     .sort( ( a, b ) => a.sequence - b.sequence ),
      })),
  })) ;
}

export function printQuestionPaper( attempt: ExamAttemptSO ): void {
  const pw = window.open( '', '_blank' ) ;
  if( !pw ) return ;
  pw.document.write( buildPrintHTML( attempt ) ) ;
  pw.document.close() ;
  pw.onload = () => pw.print() ;
}

// ─── private helpers ─────────────────────────────────────────────────────────

function imgURL( sourceId: string, fileName: string ): string {
  return `${ environment.apiRoot }/question-img/${ sourceId }/${ fileName }` ;
}

function questionRows( questions: QPQuestion[] ): string {
  return questions.map( q => `
    <div class="qp-question">
      <div class="qp-qnum">Q${ q.number }.</div>
      <div>
        ${ q.images.map( img =>
          `<img class="qp-img" src="${ imgURL( q.sourceId, img.fileName ) }" alt="${ img.fileName }" />`
        ).join( '\n        ' ) }
      </div>
    </div>`
  ).join( '\n' ) ;
}

function sectionBlocks( sections: QPSection[] ): string {
  return sections.map( s => `
    <div class="qp-section">
      <div class="qp-section-header">${ s.title }</div>
      ${ questionRows( s.questions ) }
    </div>`
  ).join( '\n' ) ;
}

const PRINT_CSS = `
  @page {
    size: A4;
    margin: 15mm;
  }

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  h2.qp-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    margin-bottom: 28px;
  }

  .qp-section {
    margin-bottom: 32px;
  }

  .qp-section-header {
    font-size: 15px;
    font-weight: bold;
    background: #f0f0f0;
    border-left: 4px solid #555;
    padding: 5px 12px;
    margin-bottom: 16px;
  }

  .qp-question {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  .qp-qnum {
    font-weight: bold;
    min-width: 36px;
    flex-shrink: 0;
    font-size: 15px;
    padding-top: 2px;
  }

  .qp-img {
    max-width: 100%;
    display: block;
    margin-bottom: 4px;
  }
` ;

function buildPrintHTML( attempt: ExamAttemptSO ): string {
  const title = `${ attempt.exam.type } — Exam #${ attempt.exam.id }` ;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${ title }</title>
    <style>${ PRINT_CSS }</style>
  </head>
  <body>
    <h2 class="qp-title">${ title }</h2>
    ${ sectionBlocks( buildQPSections( attempt ) ) }
  </body>
</html>` ;
}
