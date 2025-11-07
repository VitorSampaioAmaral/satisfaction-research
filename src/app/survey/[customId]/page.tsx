'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CustomSurveyQuiz from '@/app/components/CustomSurveyQuiz'
import CustomSurveyResults from '@/app/components/CustomSurveyResults'

interface SurveyConfig {
  id: string
  customId: string
  name: string
  description?: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  chartType: string
  chartColors: string[]
  showLegend: boolean
  showGrid: boolean
  animationEnabled: boolean
  requiresPassword?: boolean
  customQuestions: Array<{
    id: number
    text: string
    category: string
    order: number
  }>
}

interface CustomSurveyResponse {
  id: string
  totalScore: number
  completedAt: string
  user: {
    name: string
    email: string
  }
}

function CustomSurveyPageContent({ params }: { params: Promise<{ customId: string }> }) {
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [result, setResult] = useState<CustomSurveyResponse | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const searchParams = useSearchParams()
  const [resolvedParams, setResolvedParams] = useState<{ customId: string } | null>(null)

  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/custom-survey/${resolvedParams.customId}`)
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Pesquisa não encontrada')
          setIsLoading(false)
          return
        }

        const configData = await response.json()
        setConfig(configData)

        // Verificar se precisa de senha de usuário
        if (configData.requiresPassword) {
          setShowPasswordInput(true)
        } else {
          setHasStarted(true)
        }
      } catch (error: any) {
        setError('Erro ao carregar pesquisa')
        console.error('Erro:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [resolvedParams])

  const handleStartWithPassword = () => {
    if (!userPassword.trim()) {
      setError('Digite a senha de acesso')
      return
    }
    setHasStarted(true)
  }

  const handleComplete = async (responses: { questionId: number; score: number }[]) => {
    if (!config) return

    try {
      const userName = searchParams.get('name') || ''
      const userEmail = searchParams.get('email') || ''

      const response = await fetch(`/api/custom-survey/${config.customId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          name: userName,
          email: userEmail,
          userPassword: userPassword || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao enviar respostas')
        return
      }

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setError('Erro ao enviar respostas')
      console.error('Erro:', error)
    }
  }

  const handleNewSurvey = () => {
    setResult(null)
    setHasStarted(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e293b' }}>
        <div className="text-white text-xl">Carregando pesquisa...</div>
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e293b' }}>
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p>{error}</p>
          <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            Voltar para página inicial
          </a>
        </div>
      </div>
    )
  }

  if (!config) return null

  const theme = {
    primary: config.primaryColor,
    secondary: config.secondaryColor,
    background: config.backgroundColor,
    text: config.textColor,
    accent: config.accentColor
  }

  return (
    <main 
      className="min-h-screen py-12"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <header className="text-center mb-10">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: theme.primary }}
          >
            {config.name}
          </h1>
          {config.description && (
            <p className="text-lg opacity-90 mb-4">{config.description}</p>
          )}
        </header>

        {showPasswordInput && !hasStarted && (
          <div className="w-full max-w-xl mx-auto">
            <div 
              className="rounded-2xl shadow-xl p-8 border-2"
              style={{ 
                backgroundColor: theme.background,
                borderColor: theme.primary,
                color: theme.text
              }}
            >
              <h2 className="text-2xl font-semibold mb-6">Acesso à Pesquisa</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.primary,
                      color: theme.text
                    }}
                    placeholder="Digite a senha de acesso"
                  />
                  {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
                </div>
                <button
                  onClick={handleStartWithPassword}
                  className="w-full px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  Acessar Pesquisa
                </button>
              </div>
            </div>
          </div>
        )}

        {hasStarted && !result && config && (
          <CustomSurveyQuiz 
            config={config}
            onComplete={handleComplete}
          />
        )}

        {result && config && (
          <CustomSurveyResults 
            response={result}
            config={config}
            onNewSurvey={handleNewSurvey}
          />
        )}
      </div>
    </main>
  )
}

export default function CustomSurveyPage({ params }: { params: Promise<{ customId: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e293b' }}>
        <div className="text-white text-xl">Carregando...</div>
      </div>
    }>
      <CustomSurveyPageContent params={params} />
    </Suspense>
  )
}

