export type ValidationMsg = {
    type : 'INFO' | 'WARNING' | 'ERROR',
    field : string,
    value : string,
    msg : string
}

export type MsgCount = {
    numError : number,
    numWarning : number,
    numInfo : number
}

export type ExerciseValidationResult = {
    name : string,
    problems: string[],
    validationMsgs : ValidationMsg[],
    msgCount : MsgCount
}

export type ChapterValidationResult = {
    title : string,
    exercises : ExerciseValidationResult[],
    validationMsgs : ValidationMsg[],
    msgCount : MsgCount
}

export type BookValidationResult = {
    subject : string,
    series : string,
    name : string,
    author : string,
    shortName : string,
    chapters : ChapterValidationResult[],
    validationMsgs : ValidationMsg[],
    msgCount : MsgCount,
    totalMsgCount : MsgCount
}

