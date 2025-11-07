import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Buscar configuração por ID customizado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    console.log('GET /api/builder/config/[customId] - customId recebido:', customId)
    const config = await SurveyConfigService.getConfigByCustomId(customId)

    if (!config) {
      console.error('Configuração não encontrada para customId:', customId)
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

// Atualizar configuração
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const body = await request.json()
    const { adminPassword, ...updateData } = body

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Senha de administrador é obrigatória' },
        { status: 400 }
      )
    }

    const config = await SurveyConfigService.updateConfig(
      customId,
      updateData,
      adminPassword
    )

    return NextResponse.json(config)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar configuração' },
      { status: 400 }
    )
  }
}

