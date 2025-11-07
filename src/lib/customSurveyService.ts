import { prisma } from './prisma'

export class CustomSurveyService {
  /**
   * Cria uma resposta de pesquisa customizada
   */
  static async createCustomSurveyResponse(
    configId: string,
    userId: string,
    responses: Array<{ questionId: number; score: number }>
  ) {
    // Calcular pontuação total
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0)

    // Criar resposta da pesquisa
    const surveyResponse = await prisma.customSurveyResponse.create({
      data: {
        configId,
        userId,
        totalScore,
        questionResponses: {
          create: responses.map(r => ({
            questionId: r.questionId,
            score: r.score
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questionResponses: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                category: true,
                order: true
              }
            }
          }
        }
      }
    })

    return surveyResponse
  }
}

