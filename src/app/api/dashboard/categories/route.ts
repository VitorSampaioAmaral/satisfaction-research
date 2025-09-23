import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Média de score por categoria
    const questions = await prisma.question.findMany({
      include: { responses: true },
    })

    const byCategory: Record<string, { total: number; count: number }> = {}
    for (const q of questions) {
      const sum = q.responses.reduce((acc, r) => acc + r.score, 0)
      if (!byCategory[q.category]) byCategory[q.category] = { total: 0, count: 0 }
      byCategory[q.category].total += sum
      byCategory[q.category].count += q.responses.length
    }

    const result = Object.entries(byCategory).map(([category, { total, count }]) => ({
      category,
      average: count > 0 ? total / count : 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao calcular categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


