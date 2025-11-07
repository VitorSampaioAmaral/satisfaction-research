import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Importar perguntas de um CSV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const body = await request.json()
    const { adminPassword, csvData } = body

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Senha de administrador é obrigatória' },
        { status: 400 }
      )
    }

    // Log para debug (remover em produção)
    console.log('Import CSV - customId:', customId)
    console.log('Import CSV - adminPassword recebida:', adminPassword ? '***' : 'vazia')

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { error: 'Dados CSV são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await SurveyConfigService.importQuestionsFromCSV(
      customId,
      csvData,
      adminPassword
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao importar CSV:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao importar perguntas do CSV' },
      { status: 400 }
    )
  }
}

