export type APIResponse = {
    data : any,
    executionResult : {
        status : string,
        message : string,
        exceptionTrace : string
    }
}