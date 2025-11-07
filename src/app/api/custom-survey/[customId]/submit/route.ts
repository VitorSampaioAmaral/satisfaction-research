import { NextRequest, NextResponse } from 'next/server'
import { CustomSurveyService } from '@/lib/customSurveyService'
import { SurveyConfigService } from '@/lib/surveyConfigService'
import { prisma } from '@/lib/prisma'

// Submeter resposta de pesquisa customizada
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const body = await request.json()
    const { responses, name, email, userPassword } = body

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'responses é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    // Validar se todas as respostas têm questionId e score
    const validResponses = responses.every(
      (response: any) => 
        typeof response.questionId === 'number' && 
        typeof response.score === 'number' &&
        response.score >= 0 && 
        response.score <= 3
    )

    if (!validResponses) {
      return NextResponse.json(
        { error: 'Formato de respostas inválido' },
        { status: 400 }
      )
    }

    // Buscar configuração
    const config = await SurveyConfigService.getConfigByCustomId(customId)
    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: 'Pesquisa não encontrada ou não está ativa' },
        { status: 404 }
      )
    }

    // Verificar senha de usuário se a pesquisa tiver uma configurada
    if (config.userPassword) {
      if (!userPassword) {
        return NextResponse.json(
          { error: 'Esta pesquisa requer uma senha de acesso' },
          { status: 401 }
        )
      }
      const isValidPassword = await SurveyConfigService.verifyUserPassword(customId, userPassword)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Senha de acesso inválida' },
          { status: 401 }
        )
      }
    }

    // Garantir usuário
    let effectiveUserId: string
    if (email && typeof email === 'string') {
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedName = (typeof name === 'string' && name.trim().length > 0) ? name.trim() : 'Participante'
      const user = await prisma.user.upsert({
        where: { email: trimmedEmail },
        update: { name: trimmedName },
        create: { email: trimmedEmail, name: trimmedName }
      })
      effectiveUserId = user.id
    } else {
      // Usuário anônimo
      const anonUser = await prisma.user.upsert({
        where: { email: 'anon@local' },
        update: {},
        create: { email: 'anon@local', name: 'Anônimo' }
      })
      effectiveUserId = anonUser.id
    }

    // Criar resposta da pesquisa customizada
    const surveyResponse = await CustomSurveyService.createCustomSurveyResponse(
      config.id,
      effectiveUserId,
      responses
    )

    return NextResponse.json(surveyResponse)
  } catch (error: any) {
    console.error('Erro ao submeter pesquisa customizada:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao submeter pesquisa' },
      { status: 500 }
    )
  }
}


