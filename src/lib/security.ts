// Security and validation helpers (Shanti Kutir pattern)

export function sanitisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2)
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1)
  return digits.slice(-10)
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(sanitisePhone(phone))
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin.trim())
}

export function sanitiseName(raw: string): string {
  return raw.trim().replace(/[<>'"]/g, '').slice(0, 60)
}

export function sanitizeText(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}
