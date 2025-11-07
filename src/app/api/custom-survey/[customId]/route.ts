import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Buscar configuração de pesquisa customizada (público, sem senha)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const config = await SurveyConfigService.getConfigByCustomId(customId)

    if (!config) {
      return NextResponse.json(
        { error: 'Pesquisa não encontrada' },
        { status: 404 }
      )
    }

    if (!config.isActive) {
      return NextResponse.json(
        { error: 'Esta pesquisa não está mais ativa' },
        { status: 403 }
      )
    }

    // Retornar apenas informações necessárias para exibir a pesquisa
    // (sem senhas e sem dados sensíveis)
    return NextResponse.json({
      id: config.id,
      customId: config.customId,
      name: config.name,
      description: config.description,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      accentColor: config.accentColor,
      chartType: config.chartType,
      chartColors: config.chartColors,
      showLegend: config.showLegend,
      showGrid: config.showGrid,
      animationEnabled: config.animationEnabled,
      customQuestions: config.customQuestions,
      requiresPassword: !!config.userPassword // Informar se precisa de senha, mas não a senha em si
    })
  } catch (error: any) {
    console.error('Erro ao buscar pesquisa customizada:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pesquisa' },
      { status: 500 }
    )
  }
}

