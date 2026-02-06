import type { Endpoint } from 'payload'

const DEFAULT_DEEPL_URL = 'https://api-free.deepl.com/v2/translate'

const languageMap: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  'pt-br': 'PT-BR',
  ar: 'AR',
}

const normalizeTargetLang = (value?: string): string | null => {
  if (!value) return null
  const lowered = value.toLowerCase()
  if (languageMap[lowered]) return languageMap[lowered]
  return value.toUpperCase()
}

export const translateEndpoint: Endpoint = {
  path: '/translate',
  method: 'post',
  handler: async (req) => {
    const apiKey = process.env.DEEPL_API_KEY
    const apiUrl = process.env.DEEPL_API_URL || DEFAULT_DEEPL_URL

    if (!apiKey) {
      return Response.json({ error: 'DEEPL_API_KEY not configured' }, { status: 500 })
    }

    const reqAny = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
    let body: any = null
    if (typeof reqAny.json === 'function') {
      try {
        body = await reqAny.json()
      } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
    } else if (reqAny.body) {
      body = reqAny.body
    }

    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const rawTarget = body?.targetLang || body?.target || body?.target_lang
    const targetLang = normalizeTargetLang(rawTarget)

    const texts: string[] = Array.isArray(body?.texts)
      ? body.texts.map((text: unknown) => String(text ?? '').trim()).filter(Boolean)
      : []

    if (!targetLang) {
      return Response.json({ error: 'targetLang is required' }, { status: 400 })
    }

    if (!texts.length) {
      return Response.json({ error: 'texts must be a non-empty array' }, { status: 400 })
    }

    const params = new URLSearchParams()
    params.append('auth_key', apiKey)
    params.append('target_lang', targetLang)
    texts.forEach((text: string) => params.append('text', text))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return Response.json(
        { error: 'DeepL request failed', details: errorText },
        { status: 502 },
      )
    }

    const data = await response.json()
    const translations = Array.isArray(data?.translations)
      ? data.translations.map((t: any) => t.text)
      : []

    return Response.json({ translations })
  },
}
