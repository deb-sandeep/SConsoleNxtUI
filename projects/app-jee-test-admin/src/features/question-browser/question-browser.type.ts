import { QuestionSO } from "@jee-common/util/exam-data-types";

export type QuestionSearchResSO = {
    totalResults: number,
    totalPages: number,
    pageNumber: number,
    pageSize: number,
    resultsInPage: number,
    questions: QuestionSO[]
}

