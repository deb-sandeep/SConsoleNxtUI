export interface ExamSectionTemplate {
    problemType: ( 'SCA' | 'MCA' | 'LCT' | 'NVT' | 'MMT' | 'CMT' | 'ART' ) ;
    defaultSelection: boolean;
    title: string;
    correctMarks: number;
    correctMarksEditable: boolean;
    wrongPenalty: number;
    wrongPenaltyEditable: boolean;
    numQuestions: number;
    allQuestionsCompulsory: boolean;
    numCompulsoryQuestions: number;
    instructions: string;
}

export const mainSectionTemplates : ExamSectionTemplate[] = [
    {
        problemType : 'SCA',
        defaultSelection : true,
        title : 'Single Correct Answer',
        correctMarks : 4,
        correctMarksEditable : false,
        wrongPenalty : -1,
        wrongPenaltyEditable : false,
        numQuestions : 25,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 25,
        instructions : ''
    },
    {
        problemType : 'NVT',
        defaultSelection : true,
        title : 'Numerical Value Type',
        correctMarks : 4,
        correctMarksEditable : false,
        wrongPenalty : 0,
        wrongPenaltyEditable : false,
        numQuestions : 10,
        allQuestionsCompulsory : false,
        numCompulsoryQuestions : 5,
        instructions : ''
    }
] ;

export const advancedSectionTemplates : ExamSectionTemplate[] = [

    {
        problemType : 'SCA',
        defaultSelection : true,
        title : 'Single Correct Answer',
        correctMarks : 3,
        correctMarksEditable : true,
        wrongPenalty : -1,
        wrongPenaltyEditable : true,
        numQuestions : 6,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 6,
        instructions : [
          'Each question has only one correct option.',
          'Full marks for correct answer.',
          'Negative marks for incorrect answer.'].join(' ')
    },
    {
        problemType : 'MCA',
        defaultSelection : true,
        title : 'Multiple Correct Answer',
        correctMarks : 4,
        correctMarksEditable : true,
        wrongPenalty : -2,
        wrongPenaltyEditable : true,
        numQuestions : 6,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 6,
        instructions : [
          'One or more options may be correct.',
          'Partial marking may be awarded.',
          'Negative marking may apply for incorrect selections.' ].join(' ')
    },
    {
        problemType : 'NVT',
        defaultSelection : true,
        title : 'Numerical Value Type',
        correctMarks : 4,
        correctMarksEditable : true,
        wrongPenalty : 0,
        wrongPenaltyEditable : true,
        numQuestions : 6,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 6,
        instructions : [
          'Enter the correct numerical value.',
          'No options are provided.',
          'Answer must match exactly as per required precision.'].join( ' ' )
    },
    {
        problemType : 'MMT',
        defaultSelection : false,
        title : 'Matrix Match Type',
        correctMarks : 4,
        correctMarksEditable : true,
        wrongPenalty : -1,
        wrongPenaltyEditable : true,
        numQuestions : 4,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 4,
        instructions : [
          'Match items in Column I with Column II.',
          'Multiple mappings may be correct.',
          'Partial marking may apply.'].join( ' ' )
    },
    {
        problemType : 'CMT',
        defaultSelection : false,
        title : 'Comprehension Based',
        correctMarks : 3,
        correctMarksEditable : true,
        wrongPenalty : -1,
        wrongPenaltyEditable : true,
        numQuestions : 4,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 4,
        instructions : [
          'Answer the questions based on the given paragraph or data.',
          'Each question is evaluated independently.' ].join(' ')
    },
    {
        problemType : 'ART',
        defaultSelection : false,
        title : 'Assertion–Reasoning Type',
        correctMarks : 3,
        correctMarksEditable : true,
        wrongPenalty : -1,
        wrongPenaltyEditable : true,
        numQuestions : 0,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 0,
        instructions : [
            'Each question has two statements: Assertion (A) and Reason (R).',
            'Choose the correct option:',
            '(1) A is true, R is true, and R is the correct explanation of A.',
            '(2) A is true, R is true, but R is NOT the correct explanation of A.',
            '(3) A is true, but R is false.',
            '(4) A is false, but R is true.'
        ].join('\n')
    }
] ;
