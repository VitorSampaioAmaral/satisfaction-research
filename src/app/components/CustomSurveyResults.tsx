'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

interface SurveyConfig {
  id: string
  customId: string
  name: string
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
}

interface CustomSurveyResponse {
  id: string
  totalScore: number
  completedAt: string
  user: {
    name: string
    email: string
  }
  questionResponses?: Array<{
    score: number
    question: {
      text: string
      category: string
    }
  }>
}

interface CustomSurveyResultsProps {
  response: CustomSurveyResponse
  config: SurveyConfig
  onNewSurvey: () => void
}

export default function CustomSurveyResults({ response, config, onNewSurvey }: CustomSurveyResultsProps) {
  const getClassification = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 83) return { text: 'Excelente', color: config.chartColors[2] || '#10b981' }
    if (percentage >= 67) return { text: 'Bom', color: config.chartColors[0] || '#3b82f6' }
    if (percentage >= 50) return { text: 'Regular', color: config.chartColors[3] || '#f59e0b' }
    return { text: 'Ruim', color: config.chartColors[4] || '#ef4444' }
  }

  // Calcular maxScore baseado no número de perguntas da configuração
  const questionCount = response.questionResponses?.length || 0
  const maxScore = questionCount * 3
  const classification = getClassification(response.totalScore, maxScore)

  // Preparar dados para gráficos
  const categoryData = response.questionResponses?.reduce((acc: any, qr) => {
    const cat = qr.question.category
    if (!acc[cat]) {
      acc[cat] = { category: cat, score: 0, count: 0 }
    }
    acc[cat].score += qr.score
    acc[cat].count += 1
    return acc
  }, {}) || {}

  const chartData = Object.values(categoryData).map((item: any) => ({
    name: item.category,
    média: item.count > 0 ? (item.score / item.count).toFixed(1) : 0
  }))

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (config.chartType) {
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              dataKey="média"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={config.chartColors[index % config.chartColors.length]} />
              ))}
            </Pie>
            {config.showLegend && <Legend />}
            <Tooltip />
          </PieChart>
        )
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="média" 
              stroke={config.primaryColor}
              strokeWidth={2}
              animationDuration={config.animationEnabled ? 1000 : 0}
            />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="média" 
              stroke={config.primaryColor}
              fill={config.primaryColor}
              fillOpacity={0.6}
              animationDuration={config.animationEnabled ? 1000 : 0}
            />
          </AreaChart>
        )
      default: // bar
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Bar 
              dataKey="média" 
              fill={config.primaryColor}
              animationDuration={config.animationEnabled ? 1000 : 0}
            />
          </BarChart>
        )
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Card de resultado principal */}
      <div 
        className="rounded-2xl shadow-xl p-8 border-2"
        style={{
          backgroundColor: config.backgroundColor,
          borderColor: config.primaryColor,
          color: config.textColor
        }}
      >
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: config.primaryColor }}
        >
          Obrigado pela sua participação!
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div 
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: `${config.accentColor}10`,
              borderColor: config.accentColor
            }}
          >
            <div className="text-sm opacity-75 mb-2">Pontuação Total</div>
            <div className="text-3xl font-bold" style={{ color: config.accentColor }}>
              {response.totalScore}/{maxScore}
            </div>
          </div>
          
          <div 
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: `${classification.color}10`,
              borderColor: classification.color
            }}
          >
            <div className="text-sm opacity-75 mb-2">Classificação</div>
            <div className="text-3xl font-bold" style={{ color: classification.color }}>
              {classification.text}
            </div>
          </div>
          
          <div 
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: `${config.secondaryColor}10`,
              borderColor: config.secondaryColor
            }}
          >
            <div className="text-sm opacity-75 mb-2">Percentual</div>
            <div className="text-3xl font-bold" style={{ color: config.secondaryColor }}>
              {Math.round((response.totalScore / maxScore) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <div 
          className="rounded-2xl shadow-xl p-8 border-2"
          style={{
            backgroundColor: config.backgroundColor,
            borderColor: config.primaryColor,
            color: config.textColor
          }}
        >
          <h3 
            className="text-2xl font-bold mb-6"
            style={{ color: config.primaryColor }}
          >
            Análise por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}

      {/* Botão para nova pesquisa */}
      <div className="text-center">
        <button
          onClick={onNewSurvey}
          className="px-8 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primaryColor }}
        >
          Responder Novamente
        </button>
      </div>
    </div>
  )
}

