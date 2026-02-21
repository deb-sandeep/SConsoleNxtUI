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
    instructions: string[];
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
        numQuestions : 20,
        allQuestionsCompulsory : true,
        numCompulsoryQuestions : 20,
        instructions : [
            'Each question has only one correct option.',
            'Full marks for correct answer.',
            'Negative marks for incorrect answer'
        ]
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
        instructions : [
            'One or more options may be correct.',
            'Partial marking may be awarded.',
            'Negative marking may apply for incorrect selections.'
        ]
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
          'Negative marks for incorrect answer.'
        ]
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
          'Negative marking may apply for incorrect selections.'
        ]
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
          'Answer must match exactly as per required precision.'
        ]
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
          'Partial marking may apply.'
        ]
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
          'Each question is evaluated independently.'
        ]
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
        ]
    }
] ;

export const DEFAULT_SECONDS_PER_QUESTION: Record<string, any> = {
    'IIT Physics': {
        SCA: 120, // 2.0 min
        MCA: 210, // 3.5 min
        NVT: 180, // 3.0 min
        LCT: 165, // 2.75 min
        MMT: 240, // 4.0 min
        CMT: 210, // 3.5 min
        ART: 240, // 4.0 min (reading + solving)
    },
    'IIT Chemistry': {
        SCA:  98, // 1.5 min
        MCA: 180, // 3.0 min
        NVT: 150, // 2.5 min
        LCT: 135, // 2.25 min
        MMT: 210, // 3.5 min
        CMT: 180, // 3.0 min
        ART: 210, // 3.5 min
    },
    'IIT Maths': {
        SCA: 180, // 3.5 min
        MCA: 270, // 4.5 min
        NVT: 240, // 4.0 min
        LCT: 225, // 3.75 min
        MMT: 300, // 5.0 min
        CMT: 270, // 4.5 min
        ART: 300, // 5.0 min
    },
};

