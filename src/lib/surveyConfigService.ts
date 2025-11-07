import { prisma } from './prisma'
import { 
  hashUserPassword, 
  hashAdminPassword, 
  verifyUserPassword, 
  verifyAdminPassword,
  encryptId,
  decryptId,
  generateCustomId,
  isValidCustomId,
  validatePassword
} from './crypto'

export interface CreateSurveyConfigInput {
  customId: string
  name: string
  description?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  chartType?: string
  chartColors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  animationEnabled?: boolean
  userPassword?: string
  adminPassword: string
  createdBy?: string
}

export interface UpdateSurveyConfigInput {
  name?: string
  description?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  chartType?: string
  chartColors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  animationEnabled?: boolean
  userPassword?: string
  isActive?: boolean
}

export class SurveyConfigService {
  /**
   * Cria uma nova configuração de pesquisa customizada
   */
  static async createConfig(input: CreateSurveyConfigInput) {
    // Validar ID customizado
    if (!isValidCustomId(input.customId)) {
      throw new Error('ID customizado inválido. Deve ter pelo menos 5 caracteres e conter apenas letras, números, hífens e underscores')
    }

    try {
      // Verificar se o ID customizado já existe
      const existing = await prisma.surveyConfig.findUnique({
        where: { customId: input.customId } // Buscar pelo ID original
      })

      if (existing) {
        throw new Error('ID customizado já está em uso')
      }
    } catch (error: any) {
      // Se o modelo não existe, pode ser que as tabelas não foram criadas
      if (error.message?.includes('Unknown arg') || error.message?.includes('does not exist') || error.message?.includes('P2001') || error.message?.includes('relation') || error.message?.includes('table')) {
        throw new Error('As tabelas do banco de dados não foram criadas. Configure DATABASE_URL e execute: npx prisma migrate dev --name add_survey_builder')
      }
      throw error
    }

    // Validar senha de administrador
    const adminPasswordValidation = validatePassword(input.adminPassword, true)
    if (!adminPasswordValidation.valid) {
      throw new Error(adminPasswordValidation.error)
    }

    // Validar senha de usuário se fornecida
    if (input.userPassword) {
      const userPasswordValidation = validatePassword(input.userPassword, false)
      if (!userPasswordValidation.valid) {
        throw new Error(userPasswordValidation.error)
      }
    }

    // Gerar hashes das senhas
    const adminPasswordHash = await hashAdminPassword(input.adminPassword)
    const userPasswordHash = input.userPassword 
      ? await hashUserPassword(input.userPassword)
      : null

    // Criar configuração
    // Armazenar o customId original diretamente (não criptografado) para facilitar busca
    // O hash pode ser usado como índice secundário se necessário
    const config = await prisma.surveyConfig.create({
      data: {
        customId: input.customId, // Armazenar original para busca fácil
        name: input.name,
        description: input.description,
        primaryColor: input.primaryColor || '#3b82f6',
        secondaryColor: input.secondaryColor || '#8b5cf6',
        backgroundColor: input.backgroundColor || '#ffffff',
        textColor: input.textColor || '#1f2937',
        accentColor: input.accentColor || '#10b981',
        chartType: input.chartType || 'bar',
        chartColors: JSON.stringify(input.chartColors || ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']),
        showLegend: input.showLegend ?? true,
        showGrid: input.showGrid ?? true,
        animationEnabled: input.animationEnabled ?? true,
        adminPassword: adminPasswordHash,
        userPassword: userPasswordHash,
        createdBy: input.createdBy
      }
    })

    return {
      ...config,
      customId: input.customId, // Retornar o ID não criptografado
      chartColors: JSON.parse(config.chartColors)
    }
  }

  /**
   * Busca uma configuração por ID customizado
   */
  static async getConfigByCustomId(customId: string) {
    try {
      console.log('Buscando configuração - customId:', customId)
      
      // Primeiro, tentar buscar pelo customId original (não criptografado)
      let config = await prisma.surveyConfig.findUnique({
        where: { customId: customId },
        include: {
          customQuestions: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      })

      // Se não encontrar, tentar buscar pelo hash (para compatibilidade com configurações antigas)
      if (!config) {
        const hashedId = encryptId(customId)
        config = await prisma.surveyConfig.findUnique({
          where: { customId: hashedId },
          include: {
            customQuestions: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        })
      }

      if (!config) {
        console.error('Configuração não encontrada para customId:', customId)
        // Tentar buscar todas as configurações para debug
        const allConfigs = await prisma.surveyConfig.findMany({
          select: { customId: true, name: true }
        })
        console.log('Configurações no banco:', 
          allConfigs.map(c => ({ name: c.name, customId: c.customId.substring(0, 50) }))
        )
        return null
      }

      // Remover senhas antes de retornar
      const { adminPassword, userPassword, ...safeConfig } = config
      
      return {
        ...safeConfig,
        customId: customId, // Retornar o ID não criptografado
        chartColors: JSON.parse(config.chartColors),
        userPassword: userPassword ? '***' : null // Indicar se existe senha, mas não retornar o valor
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      throw error
    }
  }

  /**
   * Verifica senha de administrador
   */
  static async verifyAdminPassword(customId: string, password: string): Promise<boolean> {
    try {
      // Remover espaços em branco da senha
      const trimmedPassword = password.trim()
      
      const config = await prisma.surveyConfig.findUnique({
        where: { customId: customId },
        select: { adminPassword: true }
      })

      if (!config) {
        console.error('Configuração não encontrada para customId:', customId)
        return false
      }

      if (!config.adminPassword) {
        console.error('Senha de administrador não encontrada na configuração')
        return false
      }

      const isValid = await verifyAdminPassword(trimmedPassword, config.adminPassword)
      if (!isValid) {
        console.error('Senha de administrador inválida para customId:', customId)
        console.error('Tentativa de senha (primeiros 3 chars):', trimmedPassword.substring(0, 3) + '***')
        console.error('Hash armazenado (primeiros 20 chars):', config.adminPassword.substring(0, 20) + '...')
      }
      return isValid
    } catch (error) {
      console.error('Erro ao verificar senha de administrador:', error)
      return false
    }
  }

  /**
   * Verifica senha de usuário comum
   */
  static async verifyUserPassword(customId: string, password: string): Promise<boolean> {
    const config = await prisma.surveyConfig.findUnique({
      where: { customId: customId },
      select: { userPassword: true }
    })

    if (!config || !config.userPassword) {
      return false // Se não houver senha de usuário, retorna false
    }

    return verifyUserPassword(password, config.userPassword)
  }

  /**
   * Atualiza uma configuração (requer senha de admin)
   */
  static async updateConfig(
    customId: string, 
    input: UpdateSurveyConfigInput, 
    adminPassword: string
  ) {
    // Verificar senha de administrador
    const isValid = await this.verifyAdminPassword(customId, adminPassword)
    if (!isValid) {
      throw new Error('Senha de administrador inválida')
    }

    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.primaryColor !== undefined) updateData.primaryColor = input.primaryColor
    if (input.secondaryColor !== undefined) updateData.secondaryColor = input.secondaryColor
    if (input.backgroundColor !== undefined) updateData.backgroundColor = input.backgroundColor
    if (input.textColor !== undefined) updateData.textColor = input.textColor
    if (input.accentColor !== undefined) updateData.accentColor = input.accentColor
    if (input.chartType !== undefined) updateData.chartType = input.chartType
    if (input.chartColors !== undefined) updateData.chartColors = JSON.stringify(input.chartColors)
    if (input.showLegend !== undefined) updateData.showLegend = input.showLegend
    if (input.showGrid !== undefined) updateData.showGrid = input.showGrid
    if (input.animationEnabled !== undefined) updateData.animationEnabled = input.animationEnabled
    if (input.isActive !== undefined) updateData.isActive = input.isActive

    // Atualizar senha de usuário se fornecida
    if (input.userPassword !== undefined) {
      const userPasswordValidation = validatePassword(input.userPassword, false)
      if (!userPasswordValidation.valid) {
        throw new Error(userPasswordValidation.error)
      }
      updateData.userPassword = await hashUserPassword(input.userPassword)
    }

    const config = await prisma.surveyConfig.update({
      where: { customId: customId },
      data: updateData
    })

    return {
      ...config,
      customId: customId,
      chartColors: JSON.parse(config.chartColors)
    }
  }

  /**
   * Lista todas as configurações ativas
   */
  static async listConfigs() {
    try {
      const configs = await prisma.surveyConfig.findMany({
        where: { isActive: true },
        select: {
          id: true,
          customId: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Retornar IDs customizados (já estão no formato original)
      return configs.map(config => ({
        ...config,
        customId: config.customId // Já está no formato original
      }))
    } catch (error) {
      console.error('Erro ao listar configurações:', error)
      throw error
    }
  }

  /**
   * Adiciona perguntas customizadas a uma configuração
   */
  static async addQuestions(
    customId: string,
    questions: Array<{ text: string; category: string; order: number }>,
    adminPassword: string
  ) {
    // Verificar senha de administrador
    const isValid = await this.verifyAdminPassword(customId, adminPassword)
    if (!isValid) {
      throw new Error('Senha de administrador inválida')
    }

    // Buscar o ID interno da configuração
    const configRecord = await prisma.surveyConfig.findUnique({
      where: { customId: customId },
      select: { id: true }
    })

    if (!configRecord) {
      throw new Error('Configuração não encontrada')
    }

    // Validar que não há perguntas duplicadas na lista enviada
    const ordersInRequest = new Set<number>()
    const duplicates: number[] = []
    questions.forEach(q => {
      if (ordersInRequest.has(q.order)) {
        duplicates.push(q.order)
      }
      ordersInRequest.add(q.order)
    })

    if (duplicates.length > 0) {
      throw new Error(`Há perguntas duplicadas com a mesma ordem: ${duplicates.join(', ')}. Cada pergunta deve ter uma ordem única.`)
    }

    // Buscar perguntas existentes para evitar duplicatas
    const existingQuestions = await prisma.customQuestion.findMany({
      where: { configId: configRecord.id },
      select: { order: true, id: true }
    })

    const existingOrders = new Set(existingQuestions.map(q => q.order))
    
    // Filtrar perguntas que já existem (mesma ordem) e criar apenas as novas
    const newQuestions = questions.filter(q => !existingOrders.has(q.order))
    
    if (newQuestions.length === 0) {
      // Se todas as perguntas já existem, atualizar as existentes
      const updatePromises = questions.map(q =>
        prisma.customQuestion.updateMany({
          where: {
            configId: configRecord.id,
            order: q.order
          },
          data: {
            text: q.text,
            category: q.category
          }
        })
      )
      await Promise.all(updatePromises)
      return { count: questions.length, updated: true }
    }
    
    // Criar apenas as novas perguntas
    const createdQuestions = await prisma.customQuestion.createMany({
      data: newQuestions.map(q => ({
        configId: configRecord.id,
        text: q.text,
        category: q.category,
        order: q.order
      })),
      skipDuplicates: true // Pular duplicatas se houver
    })

    // Atualizar perguntas existentes
    const updatePromises = questions
      .filter(q => existingOrders.has(q.order))
      .map(q =>
        prisma.customQuestion.updateMany({
          where: {
            configId: configRecord.id,
            order: q.order
          },
          data: {
            text: q.text,
            category: q.category
          }
        })
      )
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    return { count: createdQuestions.count, updated: updatePromises.length > 0 }
  }

  /**
   * Importa perguntas de um CSV
   */
  static async importQuestionsFromCSV(
    customId: string,
    csvData: string,
    adminPassword: string
  ) {
    // Verificar senha de administrador
    const isValid = await this.verifyAdminPassword(customId, adminPassword)
    if (!isValid) {
      throw new Error('Senha de administrador inválida')
    }

    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim())
    const questions: Array<{ text: string; category: string; order: number }> = []

    // Assumir formato: text,category,order ou text,category (order será o índice)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 2) continue

      const text = parts[0]
      const category = parts[1]
      const order = parts[2] ? parseInt(parts[2], 10) : i + 1

      if (text && category && !isNaN(order)) {
        questions.push({ text, category, order })
      }
    }

    if (questions.length === 0) {
      throw new Error('Nenhuma pergunta válida encontrada no CSV')
    }

    // Buscar o ID interno da configuração
    const configRecord = await prisma.surveyConfig.findUnique({
      where: { customId: customId },
      select: { id: true }
    })

    if (!configRecord) {
      throw new Error('Configuração não encontrada')
    }

    // Criar perguntas usando o ID interno
    const createdQuestions = await prisma.customQuestion.createMany({
      data: questions.map(q => ({
        configId: configRecord.id,
        text: q.text,
        category: q.category,
        order: q.order
      }))
    })

    return createdQuestions
  }
}

