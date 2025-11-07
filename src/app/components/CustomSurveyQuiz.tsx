'use client'

import React, { useState } from 'react'

const scaleLabels = [
  "Discordo completamente",
  "Discordo",
  "Concordo",
  "Concordo completamente"
]

interface SurveyConfig {
  id: string
  customId: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  customQuestions: Array<{
    id: number
    text: string
    category: string
    order: number
  }>
}

interface CustomSurveyQuizProps {
  config: SurveyConfig
  onComplete: (responses: { questionId: number; score: number }[]) => void
}

export default function CustomSurveyQuiz({ config, onComplete }: CustomSurveyQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<{ questionId: number; score: number }[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  // Inicializar respostas
  React.useEffect(() => {
    if (config.customQuestions && config.customQuestions.length > 0) {
      setResponses(
        config.customQuestions.map(q => ({ questionId: q.id, score: -1 }))
      )
    }
  }, [config])

  const handleResponse = (value: number) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = { ...newResponses[currentQuestion], score: value }
    setResponses(newResponses)
  }

  const handleNext = () => {
    if (currentQuestion < config.customQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    const allAnswered = responses.every(r => r.score >= 0)
    if (allAnswered) {
      onComplete(responses)
    }
  }

  if (!config.customQuestions || config.customQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Esta pesquisa não possui perguntas configuradas.</p>
      </div>
    )
  }

  if (isCompleted) {
    const allAnswered = responses.every(r => r.score >= 0)
    const answeredCount = responses.filter(r => r.score >= 0).length
    const totalQuestions = config.customQuestions.length

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div 
          className="rounded-2xl shadow-xl p-8 border-2"
          style={{
            backgroundColor: config.backgroundColor,
            borderColor: config.primaryColor,
            color: config.textColor
          }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: config.primaryColor }}>
            Pesquisa Concluída!
          </h2>
          <p className="mb-6">
            Você respondeu {answeredCount} de {totalQuestions} perguntas.
          </p>
          {allAnswered ? (
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
            >
              Enviar Respostas
            </button>
          ) : (
            <div>
              <p className="mb-4 text-red-500">Por favor, responda todas as perguntas antes de enviar.</p>
              <button
                onClick={() => setIsCompleted(false)}
                className="w-full px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity border-2"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: config.primaryColor,
                  color: config.primaryColor
                }}
              >
                Voltar para Completar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const question = config.customQuestions[currentQuestion]
  const currentResponse = responses[currentQuestion]?.score ?? -1
  const progress = ((currentQuestion + 1) / config.customQuestions.length) * 100

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{ color: config.textColor }}>
          <span>Pergunta {currentQuestion + 1} de {config.customQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${config.primaryColor}20` }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: config.primaryColor
            }}
          />
        </div>
      </div>

      {/* Card da pergunta */}
      <div 
        className="rounded-2xl shadow-xl p-8 border-2 mb-6"
        style={{
          backgroundColor: config.backgroundColor,
          borderColor: config.primaryColor,
          color: config.textColor
        }}
      >
        <div className="mb-4">
          <span 
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: `${config.accentColor}20`,
              color: config.accentColor
            }}
          >
            {question.category}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold mb-8" style={{ color: config.textColor }}>
          {question.text}
        </h2>

        {/* Escala de resposta */}
        <div className="space-y-3">
          {[0, 1, 2, 3].map((value) => (
            <button
              key={value}
              onClick={() => handleResponse(value)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                currentResponse === value ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: currentResponse === value 
                  ? config.primaryColor 
                  : 'transparent',
                borderColor: currentResponse === value 
                  ? config.primaryColor 
                  : `${config.primaryColor}40`,
                color: currentResponse === value 
                  ? '#ffffff' 
                  : config.textColor
              }}
            >
              <div className="flex items-center justify-between">
                <span>{scaleLabels[value]}</span>
                {currentResponse === value && (
                  <span className="text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex-1 px-6 py-3 rounded-lg font-semibold border-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'transparent',
            borderColor: config.secondaryColor,
            color: config.secondaryColor
          }}
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentResponse < 0}
          className="flex-1 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: config.primaryColor }}
        >
          {currentQuestion === config.customQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
        </button>
      </div>
    </div>
  )
}


