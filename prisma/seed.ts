import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  {
    text: "Me sinto valorizado e reconhecido no meu trabalho",
    category: "Reconhecimento",
    order: 1
  },
  {
    text: "O ambiente de trabalho é colaborativo e positivo",
    category: "Ambiente",
    order: 2
  },
  {
    text: "Tenho oportunidades claras de crescimento e desenvolvimento",
    category: "Crescimento",
    order: 3
  },
  {
    text: "A comunicação entre equipes e gestores é eficaz",
    category: "Comunicação",
    order: 4
  },
  {
    text: "Meu trabalho tem propósito e contribui para os objetivos da empresa",
    category: "Propósito",
    order: 5
  },
  {
    text: "A empresa promove um equilíbrio saudável entre vida pessoal e profissional",
    category: "Equilíbrio",
    order: 6
  },
  {
    text: "Recebo feedback construtivo e regular sobre meu desempenho",
    category: "Feedback",
    order: 7
  },
  {
    text: "A liderança é inspiradora e me motiva a dar o meu melhor",
    category: "Liderança",
    order: 8
  },
  {
    text: "Tenho autonomia suficiente para realizar minhas tarefas",
    category: "Autonomia",
    order: 9
  },
  {
    text: "Recomendaria esta empresa como um bom lugar para trabalhar",
    category: "Recomendação",
    order: 10
  }
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar perguntas existentes
  await prisma.questionResponse.deleteMany()
  await prisma.surveyResponse.deleteMany()
  await prisma.question.deleteMany()

  // Criar perguntas
  for (const question of questions) {
    await prisma.question.create({
      data: question
    })
  }

  console.log(`✅ ${questions.length} perguntas criadas com sucesso!`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
