import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Distribuição de totalScore (histograma simples por faixa)
    const responses = await prisma.surveyResponse.findMany({
      select: { totalScore: true }
    })

    const buckets = [
      { label: '0-9', min: 0, max: 9, count: 0 },
      { label: '10-14', min: 10, max: 14, count: 0 },
      { label: '15-19', min: 15, max: 19, count: 0 },
      { label: '20-24', min: 20, max: 24, count: 0 },
      { label: '25-30', min: 25, max: 30, count: 0 },
    ]

    for (const r of responses) {
      const b = buckets.find(b => r.totalScore >= b.min && r.totalScore <= b.max)
      if (b) b.count += 1
    }

    return NextResponse.json(buckets)
  } catch (error) {
    console.error('Erro ao calcular distribuição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


