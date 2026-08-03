import { MarkingSchemeRowTpl, SectionInstructionsTemplate } from "./section-instructions.model";

// Instruction texts sourced from real JEE Advanced papers:
//   SCA/MCA/NVT/MMT - JEE Advanced 2023-25 CBT screenshots
//   IVT/CMT         - JEE Advanced 2023 Paper 2 (verbatim)
//   LCT             - JEE Advanced 2017 Paper 2, ORS wording modernized to CBT
//   ART             - IIT-JEE 2007 Paper 2, recast into the NTA CBT register
// Placeholders in {braces} are resolved against the context built in
// buildInstructionContext() from the section's ExamSectionSO. Inline <b> tags
// are trusted developer-authored markup rendered via [innerHTML].

const HEADER = 'SECTION {sectionOrdinal} (Maximum Marks: {maxMarks})' ;

const MARKING_INTRO =
    'Answer to each question will be evaluated <b>according to the following marking scheme</b>:' ;

const FULL_ONLY_CORRECT_OPTION: MarkingSchemeRowTpl = {
  kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
  condition: 'If <b>ONLY</b> the correct option is chosen;'
} ;

const ZERO_UNANSWERED: MarkingSchemeRowTpl = {
  kind: 'zero', label: 'Zero Marks', marks: '0',
  condition: 'If none of the options is chosen (i.e. the question is unanswered);'
} ;

const ZERO_ALL_OTHER: MarkingSchemeRowTpl = {
  kind: 'zero', label: 'Zero Marks', marks: '0',
  condition: 'In all other cases.',
  conditionWhenPenalty: 'If no answer is entered (i.e. the question is unanswered);'
} ;

const NEGATIVE_ALL_OTHER: MarkingSchemeRowTpl = {
  kind: 'negative', label: 'Negative Marks', marks: '−{wrongPenalty}',
  condition: 'In all other cases.'
} ;

const NUMERIC_KEYPAD_BULLETS = [
  'The answer to each question is a <b>NUMERICAL VALUE</b>.',
  'For each question, enter the correct numerical value of the answer using the mouse and ' +
      'the on-screen virtual numeric keypad in the place designated to enter the answer.',
  'If the numerical value has more than two decimal places, <b>truncate/round-off</b> the ' +
      'value to <b>TWO</b> decimal places.',
] ;

export const SECTION_INSTRUCTION_TEMPLATES: Record<string, SectionInstructionsTemplate> = {

  SCA: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> questions.',
      'Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONLY ONE</b> of ' +
          'these four options is the correct answer.',
      'For each question, choose the option corresponding to the correct answer.',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      FULL_ONLY_CORRECT_OPTION,
      ZERO_UNANSWERED,
      NEGATIVE_ALL_OTHER,
    ],
  },

  MCA: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> questions.',
      'Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONE OR MORE THAN ' +
          'ONE</b> of these four option(s) is(are) correct answer(s).',
      'For each question, choose the option(s) corresponding to (all) the correct answer(s).',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      {
        kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
        condition: '<b>ONLY</b> if (all) the correct option(s) is(are) chosen;'
      },
      {
        kind: 'partial', label: 'Partial Marks', marks: '+{partialMarks3}',
        condition: 'If all the four options are correct but <b>ONLY</b> three options are chosen;'
      },
      {
        kind: 'partial', label: 'Partial Marks', marks: '+{partialMarks2}',
        condition: 'If three or more options are correct but <b>ONLY</b> two options are ' +
            'chosen, both of which are correct;'
      },
      {
        kind: 'partial', label: 'Partial Marks', marks: '+{partialMarks1}',
        condition: 'If two or more options are correct but <b>ONLY</b> one option is chosen ' +
            'and it is a correct option;'
      },
      ZERO_UNANSWERED,
      NEGATIVE_ALL_OTHER,
    ],
    example: {
      lead: 'For example, in a question, if (A), (B) and (D) are the <b>ONLY</b> three ' +
          'options corresponding to correct answers, then',
      lines: [
        'choosing ONLY (A), (B) and (D) will get +{correctMarks} marks;',
        'choosing ONLY (A) and (B) will get +{partialMarks2} marks;',
        'choosing ONLY (A) and (D) will get +{partialMarks2} marks;',
        'choosing ONLY (B) and (D) will get +{partialMarks2} marks;',
        'choosing ONLY (A) will get +{partialMarks1} mark;',
        'choosing ONLY (B) will get +{partialMarks1} mark;',
        'choosing ONLY (D) will get +{partialMarks1} mark;',
        'choosing no option (i.e. the question is unanswered) will get 0 marks; and',
        'choosing any other combination of options will get −{wrongPenalty} marks.',
      ],
    },
  },

  NVT: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> questions.',
      ...NUMERIC_KEYPAD_BULLETS,
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      {
        kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
        condition: 'If ONLY the correct numerical value is entered in the designated place;'
      },
      ZERO_ALL_OTHER,
      NEGATIVE_ALL_OTHER,
    ],
  },

  IVT: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> questions.',
      'The answer to each question is a <b>NON-NEGATIVE INTEGER</b>.',
      'For each question, enter the correct integer corresponding to the answer using the ' +
          'mouse and the on-screen virtual numeric keypad in the place designated to enter ' +
          'the answer.',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      {
        kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
        condition: 'If ONLY the correct integer is entered;'
      },
      ZERO_ALL_OTHER,
      NEGATIVE_ALL_OTHER,
    ],
  },

  MMT: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> Matching List Sets.',
      'Each set has <b>ONE</b> Multiple Choice Question.',
      'Each set has <b>TWO</b> lists: <b>List-I</b> and <b>List-II</b>.',
      '<b>List-I</b> has <b>Four</b> entries (P), (Q), (R) and (S) and <b>List-II</b> has ' +
          '<b>Five</b> entries (1), (2), (3), (4) and (5).',
      '<b>FOUR</b> options are given in each Multiple Choice Question based on <b>List-I</b> ' +
          'and <b>List-II</b> and <b>ONLY ONE</b> of these four options satisfies the ' +
          'condition asked in the Multiple Choice Question.',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      {
        kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
        condition: '<b>ONLY</b> if the option corresponding to the correct combination is chosen;'
      },
      ZERO_UNANSWERED,
      NEGATIVE_ALL_OTHER,
    ],
  },

  CMT: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numParagraphsWord}</b> paragraphs.',
      'Based on each paragraph, there are <b>TWO (02)</b> questions.',
      ...NUMERIC_KEYPAD_BULLETS,
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      {
        kind: 'full', label: 'Full Marks', marks: '+{correctMarks}',
        condition: 'If ONLY the correct numerical value is entered in the designated place;'
      },
      ZERO_ALL_OTHER,
      NEGATIVE_ALL_OTHER,
    ],
  },

  LCT: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numParagraphsWord}</b> paragraphs.',
      'Based on each paragraph, there are <b>TWO (02)</b> Multiple Choice Questions.',
      'Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONLY ONE</b> of ' +
          'these four options is the correct answer.',
      'For each question, choose the option corresponding to the correct answer.',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      FULL_ONLY_CORRECT_OPTION,
      ZERO_UNANSWERED,
      NEGATIVE_ALL_OTHER,
    ],
  },

  ART: {
    header: HEADER,
    bullets: [
      'This section contains <b>{numQuestionsWord}</b> questions.',
      'Each question contains <b>STATEMENT-1</b> (Assertion) and <b>STATEMENT-2</b> (Reason).',
      'Each question has <b>FOUR</b> options (A), (B), (C) and (D). <b>ONLY ONE</b> of ' +
          'these four options is the correct answer.',
      '(A) Statement-1 is True, Statement-2 is True; Statement-2 is a <b>correct ' +
          'explanation</b> for Statement-1.',
      '(B) Statement-1 is True, Statement-2 is True; Statement-2 is <b>NOT</b> a correct ' +
          'explanation for Statement-1.',
      '(C) Statement-1 is True, Statement-2 is False.',
      '(D) Statement-1 is False, Statement-2 is True.',
      'For each question, choose the option corresponding to the correct answer.',
    ],
    markingIntro: MARKING_INTRO,
    markingScheme: [
      FULL_ONLY_CORRECT_OPTION,
      ZERO_UNANSWERED,
      NEGATIVE_ALL_OTHER,
    ],
  },
} ;
