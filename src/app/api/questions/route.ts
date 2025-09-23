import { NextResponse } from 'next/server'
import { SurveyService } from '@/lib/surveyService'

export async function GET() {
  try {
    const questions = await SurveyService.getQuestions()
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
