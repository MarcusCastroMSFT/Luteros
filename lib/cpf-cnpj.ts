export function normalizeCpfCnpj(value: string): string {
  return value.replace(/\D/g, '')
}

function allDigitsEqual(digits: string): boolean {
  return /^(\d)\1+$/.test(digits)
}

function checkDigit(digits: string, length: number, startWeight: number): number {
  let sum = 0
  for (let i = 0; i < length; i += 1) {
    sum += Number(digits[i]) * (startWeight - i)
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(value: string): boolean {
  const digits = normalizeCpfCnpj(value)
  if (digits.length !== 11 || allDigitsEqual(digits)) return false
  return checkDigit(digits, 9, 10) === Number(digits[9])
    && checkDigit(digits, 10, 11) === Number(digits[10])
}

const CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const CNPJ_WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function cnpjDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + Number(digits[i]) * weight, 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const digits = normalizeCpfCnpj(value)
  if (digits.length !== 14 || allDigitsEqual(digits)) return false
  return cnpjDigit(digits, CNPJ_WEIGHTS_1) === Number(digits[12])
    && cnpjDigit(digits, CNPJ_WEIGHTS_2) === Number(digits[13])
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = normalizeCpfCnpj(value)
  return digits.length === 11 ? isValidCpf(digits) : isValidCnpj(digits)
}

export function formatCpfCnpj(value: string): string {
  const digits = normalizeCpfCnpj(value).slice(0, 14)
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
