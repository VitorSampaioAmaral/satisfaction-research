import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Adicionar perguntas a uma configuração
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const body = await request.json()
    const { adminPassword, questions } = body

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Senha de administrador é obrigatória' },
        { status: 400 }
      )
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Perguntas são obrigatórias e devem ser um array' },
        { status: 400 }
      )
    }

    const result = await SurveyConfigService.addQuestions(
      customId,
      questions,
      adminPassword
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar perguntas' },
      { status: 400 }
    )
  }
}

