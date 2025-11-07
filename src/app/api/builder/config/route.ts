import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Criar nova configuração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customId,
      name,
      description,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      accentColor,
      chartType,
      chartColors,
      showLegend,
      showGrid,
      animationEnabled,
      userPassword,
      adminPassword
    } = body

    if (!customId || !name || !adminPassword) {
      return NextResponse.json(
        { error: 'customId, name e adminPassword são obrigatórios' },
        { status: 400 }
      )
    }

    const config = await SurveyConfigService.createConfig({
      customId,
      name,
      description,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      accentColor,
      chartType,
      chartColors,
      showLegend,
      showGrid,
      animationEnabled,
      userPassword,
      adminPassword
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar configuração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar configuração' },
      { status: 400 }
    )
  }
}

// Listar todas as configurações
export async function GET(request: NextRequest) {
  try {
    const configs = await SurveyConfigService.listConfigs()
    return NextResponse.json(configs)
  } catch (error: any) {
    console.error('Erro ao listar configurações:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar configurações' },
      { status: 500 }
    )
  }
}

