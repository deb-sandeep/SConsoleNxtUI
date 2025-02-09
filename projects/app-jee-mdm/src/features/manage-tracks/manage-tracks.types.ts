import { Topic } from "../../base-types";

export type Track = {
  id: number,
  trackName: string,
  color: string,
  syllabusName: string,
  assignedTopics: Topic[]
}