import { prisma } from './prisma'
import { Question, SurveyResponse, QuestionResponse } from '@prisma/client'

export class SurveyService {
  // Buscar todas as perguntas ordenadas
  static async getQuestions(): Promise<Question[]> {
    return await prisma.question.findMany({
      orderBy: { order: 'asc' }
    })
  }

  // Criar uma nova resposta de pesquisa
  static async createSurveyResponse(
    userId: string,
    responses: { questionId: number; score: number }[]
  ): Promise<SurveyResponse> {
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0)

    return await prisma.surveyResponse.create({
      data: {
        userId,
        totalScore,
        questionResponses: {
          create: responses.map(response => ({
            questionId: response.questionId,
            score: response.score
          }))
        }
      }
    })
  }

  // Buscar respostas de um usuário
  static async getUserSurveyResponses(userId: string) {
    return await prisma.surveyResponse.findMany({
      where: { userId },
      include: {
        questionResponses: {
          include: {
            question: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })
  }

  // Buscar uma resposta específica com detalhes
  static async getSurveyResponseWithDetails(responseId: string) {
    return await prisma.surveyResponse.findUnique({
      where: { id: responseId },
      include: {
        questionResponses: {
          include: {
            question: true
          }
        },
        user: true
      }
    })
  }

  // Buscar estatísticas gerais
  static async getSurveyStats() {
    const totalResponses = await prisma.surveyResponse.count()
    const totalUsers = await prisma.user.count()
    const avgScore = await prisma.surveyResponse.aggregate({
      _avg: {
        totalScore: true
      }
    })

    return {
      totalResponses,
      totalUsers,
      averageScore: avgScore._avg.totalScore || 0
    }
  }
}
