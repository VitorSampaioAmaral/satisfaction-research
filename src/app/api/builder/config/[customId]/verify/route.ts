import { NextRequest, NextResponse } from 'next/server'
import { SurveyConfigService } from '@/lib/surveyConfigService'

// Verificar senha (usuário comum ou admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customId: string }> }
) {
  try {
    const { customId } = await params
    const body = await request.json()
    const { password, isAdmin } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      )
    }

    let isValid = false
    if (isAdmin) {
      isValid = await SurveyConfigService.verifyAdminPassword(customId, password)
    } else {
      isValid = await SurveyConfigService.verifyUserPassword(customId, password)
    }

    return NextResponse.json({ valid: isValid })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar senha' },
      { status: 500 }
    )
  }
}

