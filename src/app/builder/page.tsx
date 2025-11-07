'use client'

import React, { useState, useEffect } from 'react'
import { Palette, FileText, BarChart3, Lock, Upload, Save, Plus, Trash2, Edit2, Eye } from 'lucide-react'

interface SurveyConfig {
  id?: string
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
  customQuestions?: Array<{
    id?: number
    text: string
    category: string
    order: number
  }>
}

export default function BuilderPage() {
  const [config, setConfig] = useState<SurveyConfig>({
    customId: '',
    name: '',
    description: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#10b981',
    chartType: 'bar',
    chartColors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
    showLegend: true,
    showGrid: true,
    animationEnabled: true,
    customQuestions: []
  })

  const [adminPassword, setAdminPassword] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingCustomId, setEditingCustomId] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'theme' | 'questions' | 'charts'>('basic')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existingConfigs, setExistingConfigs] = useState<Array<{ customId: string; name: string }>>([])

  useEffect(() => {
    loadExistingConfigs()
  }, [])

  const loadExistingConfigs = async () => {
    try {
      const response = await fetch('/api/builder/config')
      if (response.ok) {
        const configs = await response.json()
        setExistingConfigs(configs)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleCreateConfig = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validações
      if (!config.customId || !config.name || !adminPassword) {
        setError('ID customizado, nome e senha de administrador são obrigatórios')
        return
      }

      if (adminPassword !== confirmAdminPassword) {
        setError('As senhas de administrador não coincidem')
        return
      }

      if (adminPassword.length < 12) {
        setError('Senha de administrador deve ter no mínimo 12 caracteres')
        return
      }

      const response = await fetch('/api/builder/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          adminPassword,
          userPassword: userPassword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao criar configuração')
        return
      }

      setSuccess('Configuração criada com sucesso!')
      setConfig({
        ...data,
        customQuestions: []
      })
      setIsEditing(true)
      setEditingCustomId(data.customId)
      loadExistingConfigs()
    } catch (error: any) {
      setError(error.message || 'Erro ao criar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadConfig = async (customId: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/builder/config/${customId}`)
      if (!response.ok) {
        setError('Configuração não encontrada')
        return
      }

      const data = await response.json()
      setConfig(data)
      setIsEditing(true)
      setEditingCustomId(customId)
      setSuccess('Configuração carregada com sucesso!')
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async () => {
    if (!editingCustomId || !adminPassword) {
      setError('Senha de administrador é obrigatória para atualizar')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/builder/config/${editingCustomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          adminPassword,
          userPassword: userPassword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao atualizar configuração')
        return
      }

      setSuccess('Configuração atualizada com sucesso!')
      loadExistingConfigs()
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    const newOrder = (config.customQuestions?.length || 0) + 1
    setConfig({
      ...config,
      customQuestions: [
        ...(config.customQuestions || []),
        { text: '', category: 'Geral', order: newOrder }
      ]
    })
  }

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...(config.customQuestions || [])]
    newQuestions.splice(index, 1)
    // Reordenar
    newQuestions.forEach((q, i) => {
      q.order = i + 1
    })
    setConfig({
      ...config,
      customQuestions: newQuestions
    })
  }

  const handleUpdateQuestion = (index: number, field: string, value: string | number) => {
    const newQuestions = [...(config.customQuestions || [])]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setConfig({
      ...config,
      customQuestions: newQuestions
    })
  }

  const handleSaveQuestions = async () => {
    if (!editingCustomId || !adminPassword) {
      setError('Você precisa estar editando uma configuração e fornecer a senha de administrador')
      return
    }

    if (!config.customQuestions || config.customQuestions.length === 0) {
      setError('Adicione pelo menos uma pergunta')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/builder/config/${editingCustomId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          questions: config.customQuestions
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao salvar perguntas')
        return
      }

      setSuccess('Perguntas salvas com sucesso!')
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar perguntas')
    } finally {
      setLoading(false)
    }
  }

  const handleCsvImport = async () => {
    if (!csvFile || !editingCustomId || !adminPassword) {
      setError('Selecione um arquivo CSV e forneça a senha de administrador')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const csvData = e.target?.result as string

        // Remover espaços em branco da senha antes de enviar
        const trimmedPassword = adminPassword.trim()

        const response = await fetch(`/api/builder/config/${editingCustomId}/import-csv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminPassword: trimmedPassword,
            csvData
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Erro ao importar CSV')
          setLoading(false)
          return
        }

        setSuccess('CSV importado com sucesso!')
        // Recarregar configuração para ver as perguntas importadas
        await handleLoadConfig(editingCustomId)
        setCsvFile(null)
        setLoading(false)
      }

      reader.readAsText(csvFile)
    } catch (error: any) {
      setError(error.message || 'Erro ao importar CSV')
      setLoading(false)
    }
  }

  const handleAddChartColor = () => {
    setConfig({
      ...config,
      chartColors: [...config.chartColors, '#000000']
    })
  }

  const handleUpdateChartColor = (index: number, color: string) => {
    const newColors = [...config.chartColors]
    newColors[index] = color
    setConfig({
      ...config,
      chartColors: newColors
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Builder de Pesquisa de Satisfação</h1>
          <p className="text-gray-300">Crie e customize pesquisas de satisfação com temas, perguntas e gráficos personalizados</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com configurações existentes */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow p-4 mb-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">Configurações Existentes</h2>
              <div className="space-y-2">
                {existingConfigs.map((cfg) => (
                  <button
                    key={cfg.customId}
                    onClick={() => handleLoadConfig(cfg.customId)}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
                  >
                    {cfg.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
              {/* Tabs */}
              <div className="border-b border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'basic'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <FileText className="inline mr-2" size={16} />
                    Básico
                  </button>
                  <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'theme'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Palette className="inline mr-2" size={16} />
                    Tema
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'questions'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <FileText className="inline mr-2" size={16} />
                    Perguntas
                  </button>
                  <button
                    onClick={() => setActiveTab('charts')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'charts'
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <BarChart3 className="inline mr-2" size={16} />
                    Gráficos
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Tab: Básico */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        ID Customizado *
                      </label>
                      <input
                        type="text"
                        value={config.customId}
                        onChange={(e) => setConfig({ ...config, customId: e.target.value })}
                        disabled={isEditing}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="ex: minha-pesquisa-2024"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Mínimo 5 caracteres, apenas letras, números, hífens e underscores
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Nome da Pesquisa *
                      </label>
                      <input
                        type="text"
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Ex: Pesquisa de Satisfação 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={config.description || ''}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Descrição opcional da pesquisa"
                      />
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                        <Lock className="mr-2" size={20} />
                        Senhas de Acesso
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Senha de Administrador * (mínimo 12 caracteres)
                          </label>
                          <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            placeholder="Senha forte para edição"
                          />
                          {!isEditing && (
                            <>
                              <input
                                type="password"
                                value={confirmAdminPassword}
                                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                placeholder="Confirmar senha de administrador"
                              />
                            </>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Senha de Usuário (opcional, mínimo 6 caracteres)
                          </label>
                          <input
                            type="password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            placeholder="Senha para acesso comum (opcional)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {!isEditing ? (
                        <button
                          onClick={handleCreateConfig}
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          <Plus className="mr-2" size={16} />
                          {loading ? 'Criando...' : 'Criar Configuração'}
                        </button>
                      ) : (
                        <button
                          onClick={handleUpdateConfig}
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          <Save className="mr-2" size={16} />
                          {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Tema */}
                {activeTab === 'theme' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Cor Primária
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                          />
                          <input
                            type="text"
                            value={config.primaryColor}
                            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Cor Secundária
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.secondaryColor}
                            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                            className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                          />
                          <input
                            type="text"
                            value={config.secondaryColor}
                            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Cor de Fundo
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.backgroundColor}
                            onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                            className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                          />
                          <input
                            type="text"
                            value={config.backgroundColor}
                            onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Cor do Texto
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.textColor}
                            onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                            className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                          />
                          <input
                            type="text"
                            value={config.textColor}
                            onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Cor de Destaque
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.accentColor}
                            onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                            className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                          />
                          <input
                            type="text"
                            value={config.accentColor}
                            onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Preview do Tema</h3>
                      <div
                        className="p-6 rounded-lg border-2"
                        style={{
                          backgroundColor: config.backgroundColor,
                          color: config.textColor,
                          borderColor: config.primaryColor
                        }}
                      >
                        <h4 style={{ color: config.primaryColor }} className="text-xl font-bold mb-2">
                          Título da Pesquisa
                        </h4>
                        <p className="mb-4">Este é um exemplo de como o tema ficará aplicado.</p>
                        <button
                          className="px-4 py-2 rounded"
                          style={{
                            backgroundColor: config.primaryColor,
                            color: '#ffffff'
                          }}
                        >
                          Botão Primário
                        </button>
                        <button
                          className="px-4 py-2 rounded ml-2"
                          style={{
                            backgroundColor: config.secondaryColor,
                            color: '#ffffff'
                          }}
                        >
                          Botão Secundário
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Perguntas */}
                {activeTab === 'questions' && (
                  <div className="space-y-6">
                    {!isEditing && (
                      <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded">
                        Você precisa criar ou carregar uma configuração antes de adicionar perguntas.
                      </div>
                    )}

                    {isEditing && (
                      <>
                        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Senha de Administrador (necessária para salvar/importar)
                          </label>
                          <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            placeholder="Digite a senha de administrador"
                          />
                          <p className="mt-1 text-xs text-gray-400">
                            A senha de administrador é necessária para salvar perguntas e importar CSV
                          </p>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white">Perguntas Customizadas</h3>
                          <div className="flex gap-2">
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer flex items-center">
                              <Upload className="mr-2" size={16} />
                              Importar CSV
                              <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                            {csvFile && (
                              <button
                                onClick={handleCsvImport}
                                disabled={loading || !adminPassword}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? 'Importando...' : 'Confirmar Importação'}
                              </button>
                            )}
                            <button
                              onClick={handleAddQuestion}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                              <Plus className="mr-2" size={16} />
                              Adicionar Pergunta
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {config.customQuestions?.map((question, index) => (
                            <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-700/50">
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-sm font-medium text-gray-300">
                                  Pergunta #{question.order}
                                </span>
                                <button
                                  onClick={() => handleRemoveQuestion(index)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-1">
                                    Texto da Pergunta
                                  </label>
                                  <input
                                    type="text"
                                    value={question.text}
                                    onChange={(e) => handleUpdateQuestion(index, 'text', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-600 text-white rounded-md placeholder-gray-400"
                                    placeholder="Digite a pergunta"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-1">
                                    Categoria
                                  </label>
                                  <input
                                    type="text"
                                    value={question.category}
                                    onChange={(e) => handleUpdateQuestion(index, 'category', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-600 text-white rounded-md placeholder-gray-400"
                                    placeholder="Ex: Reconhecimento, Ambiente, etc."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-1">
                                    Ordem
                                  </label>
                                  <input
                                    type="number"
                                    value={question.order}
                                    onChange={(e) => handleUpdateQuestion(index, 'order', parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-600 text-white rounded-md"
                                    min="1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {(!config.customQuestions || config.customQuestions.length === 0) && (
                            <div className="text-center py-8 text-gray-400">
                              Nenhuma pergunta adicionada. Clique em "Adicionar Pergunta" para começar.
                            </div>
                          )}
                        </div>

                        {config.customQuestions && config.customQuestions.length > 0 && (
                          <div className="flex justify-end">
                            <button
                              onClick={handleSaveQuestions}
                              disabled={loading || !adminPassword}
                              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              <Save className="mr-2" size={16} />
                              {loading ? 'Salvando...' : 'Salvar Perguntas'}
                            </button>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <h4 className="font-semibold mb-2 text-white">Formato do CSV para Importação</h4>
                          <p className="text-sm text-gray-300 mb-2">
                            O arquivo CSV deve ter o seguinte formato (uma pergunta por linha):
                          </p>
                          <code className="text-xs bg-gray-800 p-2 rounded block text-gray-300">
                            texto da pergunta,categoria,ordem
                          </code>
                          <p className="text-xs text-gray-400 mt-2">
                            Exemplo: "Me sinto valorizado no trabalho,Reconhecimento,1"
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Gráficos */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Tipo de Gráfico Padrão
                      </label>
                      <select
                        value={config.chartType}
                        onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                      >
                        <option value="bar">Barras</option>
                        <option value="line">Linha</option>
                        <option value="pie">Pizza</option>
                        <option value="area">Área</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-200">
                          Cores dos Gráficos
                        </label>
                        <button
                          onClick={handleAddChartColor}
                          className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-sm hover:bg-gray-500"
                        >
                          <Plus className="inline mr-1" size={14} />
                          Adicionar Cor
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {config.chartColors.map((color, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => handleUpdateChartColor(index, e.target.value)}
                              className="h-10 w-20 border border-gray-600 rounded bg-gray-700"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => handleUpdateChartColor(index, e.target.value)}
                              className="flex-1 px-2 py-2 bg-gray-700 border border-gray-600 text-white rounded-md text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showLegend}
                          onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-200">Mostrar Legenda</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showGrid}
                          onChange={(e) => setConfig({ ...config, showGrid: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-200">Mostrar Grade</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.animationEnabled}
                          onChange={(e) => setConfig({ ...config, animationEnabled: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-200">Habilitar Animações</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

