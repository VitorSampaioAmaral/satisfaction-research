import { NextResponse } from 'next/server'
import { SurveyService } from '@/lib/surveyService'

export async function GET() {
  try {
    const stats = await SurveyService.getSurveyStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


