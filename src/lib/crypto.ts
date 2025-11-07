import bcrypt from 'bcryptjs'
import CryptoJS from 'crypto-js'

// Chave secreta para criptografia de IDs (deve estar em variável de ambiente em produção)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-min-32-chars'

// Rounds para hash de senha de usuário comum (menos seguro)
const USER_PASSWORD_ROUNDS = 10

// Rounds para hash de senha de administrador (mais seguro, mais caracteres)
const ADMIN_PASSWORD_ROUNDS = 14

/**
 * Valida se uma senha atende aos requisitos mínimos
 * Senha de usuário: mínimo 6 caracteres
 * Senha de admin: mínimo 12 caracteres, deve conter letras maiúsculas, minúsculas, números e caracteres especiais
 */
export function validatePassword(password: string, isAdmin: boolean = false): { valid: boolean; error?: string } {
  if (isAdmin) {
    if (password.length < 12) {
      return { valid: false, error: 'Senha de administrador deve ter no mínimo 12 caracteres' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Senha de administrador deve conter pelo menos uma letra maiúscula' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Senha de administrador deve conter pelo menos uma letra minúscula' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Senha de administrador deve conter pelo menos um número' }
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, error: 'Senha de administrador deve conter pelo menos um caractere especial' }
    }
  } else {
    if (password.length < 6) {
      return { valid: false, error: 'Senha deve ter no mínimo 6 caracteres' }
    }
  }
  return { valid: true }
}

/**
 * Gera hash de senha para usuário comum
 */
export async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, USER_PASSWORD_ROUNDS)
}

/**
 * Gera hash de senha para administrador (mais seguro)
 */
export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ADMIN_PASSWORD_ROUNDS)
}

/**
 * Verifica senha de usuário comum
 */
export async function verifyUserPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Verifica senha de administrador
 */
export async function verifyAdminPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Criptografa um ID customizado (usa hash determinístico para busca)
 */
export function encryptId(id: string): string {
  // Usar SHA256 para gerar um hash determinístico (sempre o mesmo para o mesmo input)
  return CryptoJS.HmacSHA256(id, ENCRYPTION_KEY).toString()
}

/**
 * Descriptografa um ID customizado (não é possível descriptografar hash, mas podemos verificar)
 */
export function decryptId(encryptedId: string): string {
  // Como usamos hash, não podemos descriptografar diretamente
  // Mas mantemos a função para compatibilidade - na verdade não descriptografamos
  // O customId original deve ser armazenado separadamente ou buscado de outra forma
  throw new Error('Não é possível descriptografar hash. Use getConfigByCustomId para buscar pelo ID original.')
}

/**
 * Gera um ID customizado seguro a partir de uma string
 */
export function generateCustomId(input: string): string {
  // Remove espaços e caracteres especiais, converte para minúsculas
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '')
  // Adiciona timestamp para garantir unicidade
  const timestamp = Date.now().toString(36)
  return `${cleaned}-${timestamp}`
}

/**
 * Valida formato de ID customizado
 */
export function isValidCustomId(id: string): boolean {
  // ID deve ter pelo menos 5 caracteres e conter apenas letras, números, hífens e underscores
  return /^[a-zA-Z0-9_-]{5,}$/.test(id)
}

