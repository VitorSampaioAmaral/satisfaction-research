import { User, Question, SurveyResponse, QuestionResponse } from '@prisma/client'

export type { User, Question, SurveyResponse, QuestionResponse }

export interface SurveyResponseWithDetails extends SurveyResponse {
  questionResponses: (QuestionResponse & {
    question: Question;
  })[];
  user: User;
}

export interface QuestionWithResponses extends Question {
  responses: QuestionResponse[];
}
