import { NextRequest, NextResponse } from 'next/server'
import { SurveyService } from '@/lib/surveyService'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, responses, name, email } = await request.json()

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

    // Garantir usuário: se não vier userId, usar/gerar um usuário anônimo fixo por email
    // Determinar/garantir usuário: se email/nome forem informados, upsert por email
    let effectiveUserId = userId as string | undefined
    if (!effectiveUserId && email && typeof email === 'string') {
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedName = (typeof name === 'string' && name.trim().length > 0) ? name.trim() : 'Participante'
      const user = await prisma.user.upsert({
        where: { email: trimmedEmail },
        update: { name: trimmedName },
        create: { email: trimmedEmail, name: trimmedName }
      })
      effectiveUserId = user.id
    }
    // fallback anônimo
    if (!effectiveUserId) {
      const anonUser = await prisma.user.upsert({
        where: { email: 'anon@local' },
        update: {},
        create: { email: 'anon@local', name: 'Anônimo' }
      })
      effectiveUserId = anonUser.id
    }

    const surveyResponse = await SurveyService.createSurveyResponse(effectiveUserId!, responses)
    
    return NextResponse.json(surveyResponse)
  } catch (error) {
    console.error('Erro ao salvar pesquisa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
