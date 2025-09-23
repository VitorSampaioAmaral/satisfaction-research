import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recent = await prisma.surveyResponse.findMany({
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: true,
        questionResponses: true,
      },
    })
    return NextResponse.json(recent)
  } catch (error) {
    console.error('Erro ao buscar respostas recentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


