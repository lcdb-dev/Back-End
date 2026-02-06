import { NextResponse } from 'next/server'

const DEFAULT_DEEPL_URL = 'https://api.deepl.com/v2/translate'

export const dynamic = 'force-dynamic'

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

const withCors = (response: NextResponse): NextResponse => {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPL_API_KEY
  const apiUrl = process.env.DEEPL_API_URL || DEFAULT_DEEPL_URL

  if (!apiKey) {
    return withCors(
      NextResponse.json({ error: 'DEEPL_API_KEY not configured' }, { status: 500 }),
    )
  }

  const contentType = request.headers.get('content-type') || ''
  const raw = await request.text()

  if (!raw) {
    return withCors(
      NextResponse.json(
        {
          error: 'Empty request body',
          contentType,
          contentLength: request.headers.get('content-length') || '',
        },
        { status: 400 },
      ),
    )
  }

  let targetLang: string | null = null
  let texts: string[] = []

  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    raw.includes('targetLang=')

  if (isForm) {
    const params = new URLSearchParams(raw)
    targetLang = normalizeTargetLang(String(params.get('targetLang') || ''))
    texts = params
      .getAll('text')
      .map((text) => String(text ?? '').trim())
      .filter(Boolean)
  } else {
    try {
      const body = JSON.parse(raw)
      const rawTarget = body?.targetLang || body?.target || body?.target_lang
      targetLang = normalizeTargetLang(rawTarget)
      texts = Array.isArray(body?.texts)
        ? body.texts.map((text: unknown) => String(text ?? '').trim()).filter(Boolean)
        : []
    } catch {
      return withCors(
        NextResponse.json(
          {
            error: 'Invalid JSON body',
            contentType,
            bodyPreview: raw.slice(0, 200),
          },
          { status: 400 },
        ),
      )
    }
  }

  if (!targetLang) {
    return withCors(NextResponse.json({ error: 'targetLang is required' }, { status: 400 }))
  }

  if (!texts.length) {
    return withCors(
      NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 }),
    )
  }

  const params = new URLSearchParams()
  params.append('auth_key', apiKey)
  params.append('target_lang', targetLang)
  texts.forEach((text) => params.append('text', text))

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!response.ok) {
    const errorText = await response.text()
    return withCors(
      NextResponse.json(
        { error: 'DeepL request failed', details: errorText },
        { status: 502 },
      ),
    )
  }

  const data = await response.json()
  const translations = Array.isArray(data?.translations)
    ? data.translations.map((t: any) => t.text)
    : []

  return withCors(NextResponse.json({ translations }, { status: 200 }))
}
