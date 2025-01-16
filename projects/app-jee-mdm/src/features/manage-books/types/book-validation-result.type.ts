export type BookValidationResult = {
    subject : string,
    series : string,
    name : string,
    author : string,
    shortName : string,
    chapters : ChapterValidationResult[],
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ChapterValidationResult = {
    title : string,
    exercises : ExerciseValidationResult[],
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ExerciseValidationResult = {
    name : string,
    problems: string[],
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ValidationMessages = {
    messages : Record<string, ValidationMsg[]>,
    msgCount : MsgCount
}

export type ValidationMsg = {
    type : 'INFO' | 'WARNING' | 'ERROR',
    msg : string
}

export type MsgCount = {
    numError : number,
    numWarning : number,
    numInfo : number,
    total : number
}

