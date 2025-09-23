// Chave de acesso para o dashboard (25 caracteres)
export const DASHBOARD_ACCESS_KEY = "i}6EHdbXJ+<Qx%Y_=XdXsQr06"

export function validateAccessKey(key: string): boolean {
  return key === DASHBOARD_ACCESS_KEY
}
