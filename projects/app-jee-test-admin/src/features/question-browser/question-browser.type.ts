import { QuestionSO } from "../../type";

export type QuestionSearchResSO = {
    totalResults: number,
    totalPages: number,
    pageNumber: number,
    pageSize: number,
    resultsInPage: number,
    questions: QuestionSO[]
}

