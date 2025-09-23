import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Série temporal por dia com média de totalScore e contagem
    const responses = await prisma.surveyResponse.findMany({
      orderBy: { completedAt: 'asc' },
      select: { completedAt: true, totalScore: true }
    })

    const byDay: Record<string, { total: number; count: number }> = {}
    for (const r of responses) {
      const key = new Date(r.completedAt).toISOString().slice(0, 10)
      if (!byDay[key]) byDay[key] = { total: 0, count: 0 }
      byDay[key].total += r.totalScore
      byDay[key].count += 1
    }

    const series = Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, { total, count }]) => ({ date, average: total / count, count }))

    return NextResponse.json(series)
  } catch (error) {
    console.error('Erro ao montar timeline:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


