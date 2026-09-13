import type { Decision, LLMSettings, ChatMessage, BrainstormItem } from '../types'
import { calculateBalance } from './storageService'

export function buildDecisionContextPrompt(decision: Decision): string {
  const stats = calculateBalance(decision)

  const prosList = decision.pros.length > 0
    ? decision.pros.map((p, i) => `  ${i + 1}. [Вес: ${p.weight}/10] ${p.text}`).join('\n')
    : '  (нет добавленных аргументов "За")'

  const consList = decision.cons.length > 0
    ? decision.cons.map((c, i) => `  ${i + 1}. [Вес: ${c.weight}/10] ${c.text}`).join('\n')
    : '  (нет добавленных аргументов "Против")'

  return `[ТЕКУЩИЙ КОНТЕКСТ РЕШЕНИЯ]
Вопрос / Дилемма: ${decision.title || 'Без названия'}
Контекст и описание: ${decision.description || 'Не указано'}

БАЛАНС СИЛ:
- Сумма PRO (За): ${stats.proSum} баллов (${stats.proPercent}%)
- Сумма CONTRA (Против): ${stats.contraSum} баллов (${stats.contraPercent}%)
- Разница: ${stats.diff > 0 ? `+${stats.diff} в пользу PRO` : stats.diff < 0 ? `${stats.diff} в пользу CONTRA` : 'Паритет'}

АРГУМЕНТЫ ЗА (PRO):
${prosList}

АРГУМЕНТЫ ПРОТИВ (CONTRA):
${consList}
`
}

export const SYSTEM_PROMPT_ANALYST = `Ты — экспертный стратегический советник по принятию решений (Decision Making Coach & Analyst).
Твоя цель — помочь пользователю беспристрастно, глубоко и структурированно проанализировать дилемму «За и Против».
Пользователь передает тебе взвешенные аргументы по 10-балльной шкале.

Принципы твоего анализа:
1. Будь предельно конкретным, лаконичным и объективным. Избегай банальной «воды».
2. Анализируй не только сумму баллов, но и качество и асимметрию рисков (например: обратимые vs необратимые последствия).
3. Обращай внимание на критические аргументы с максимальными весами (8-10).
4. Задавай 1-2 глубоких контрольных вопроса, которые помогут пользователю окончательно определиться.
5. Форматируй ответ красиво с помощью Markdown (заголовки, списки, выделения). Отвечай на русском языке.
`

export const SYSTEM_PROMPT_DEVIL = `Ты — «Адвокат дьявола» (Devil's Advocate) и эксперт по когнитивным искажениям.
Твоя задача — безжалостно протестировать аргументы пользователя на прочность:
1. Найти скрытые предположения, принятые на веру без доказательств.
2. Проверить веса: не завышены ли второстепенные эмоции и не занижены ли критические риски (optimism bias, loss aversion, status quo bias).
3. Смоделировать наихудший сценарий (Pre-Mortem): «Представь, что прошло 6 месяцев и решение обернулось катастрофой. Что пошло не так?».
4. Задать 2-3 неудобных, но отрезвляющих вопроса.
Пиши четко, дерзко, но с максимальной пользой и уважением к пользователю. На русском языке.
`

export async function sendChatMessage(
  history: ChatMessage[],
  newMessage: string,
  decision: Decision,
  settings: LLMSettings,
  systemPrompt: string = SYSTEM_PROMPT_ANALYST
): Promise<string> {
  const context = buildDecisionContextPrompt(decision)
  const fullSystemInstruction = `${systemPrompt}\n\n${context}`

  if (settings.provider === 'gemini') {
    return sendGeminiRequest(history, newMessage, fullSystemInstruction, settings)
  } else {
    return sendOpenAIRequest(history, newMessage, fullSystemInstruction, settings)
  }
}

async function sendGeminiRequest(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string,
  settings: LLMSettings
): Promise<string> {
  if (!settings.geminiApiKey) {
    throw new Error('API ключ Google Gemini не указан. Откройте настройки ⚙️ и введите ваш ключ.')
  }

  const model = settings.geminiModel || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`

  // Convert history for Gemini format
  const contents: any[] = []
  for (const msg of history) {
    if (msg.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.content }] })
    } else if (msg.role === 'assistant') {
      contents.push({ role: 'model', parts: [{ text: msg.content }] })
    }
  }

  // Append new user message
  contents.push({ role: 'user', parts: [{ text: newMessage }] })

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const msg = errorData.error?.message || `Ошибка HTTP ${response.status}: ${response.statusText}`
    throw new Error(`Gemini API: ${msg}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Gemini API не вернул текст ответа.')
  }

  return candidate.content.parts[0].text
}

async function sendOpenAIRequest(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string,
  settings: LLMSettings
): Promise<string> {
  if (!settings.openaiApiKey) {
    throw new Error('API ключ провайдера не указан. Откройте настройки ⚙️ и введите ваш ключ.')
  }

  const baseUrl = (settings.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = settings.openaiModel || 'gpt-4o-mini'
  const url = `${baseUrl}/chat/completions`

  const messages: any[] = [
    { role: 'system', content: systemInstruction },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: newMessage },
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err.error?.message || `Ошибка HTTP ${response.status}: ${response.statusText}`
    throw new Error(`API: ${msg}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content
  if (!answer) {
    throw new Error('API не вернул текст ответа.')
  }

  return answer
}

export async function brainstormArguments(
  decision: Decision,
  settings: LLMSettings
): Promise<BrainstormItem[]> {
  const context = buildDecisionContextPrompt(decision)
  const prompt = `Ты — опытный аналитик решений.
На основе представленного решения ниже предложи 3-4 сильных упущенных аргумента «ЗА» (PRO) и 3-4 сильных упущенных аргумента «ПРОТИВ» (CONTRA), о которых пользователь мог не подумать.

ОТВЕТ ДОЛЖЕН БЫТЬ СТРОГО В ФОРМАТЕ JSON (без каких-либо обёрток, markdown-блоков, только валидный JSON массив объектов):
[
  {
    "type": "pro" | "contra",
    "text": "краткая, емкая формулировка аргумента (до 10-12 слов)",
    "suggestedWeight": целое число от 1 до 10,
    "rationale": "почему этот аргумент важен (1 предложение)"
  }
]

${context}`

  let rawResponse = ''
  if (settings.provider === 'gemini') {
    rawResponse = await sendGeminiRequest([], prompt, 'Ты помощник по генерации аргументов. Возвращай исключительно JSON.', settings)
  } else {
    rawResponse = await sendOpenAIRequest([], prompt, 'Ты помощник по генерации аргументов. Возвращай исключительно JSON.', settings)
  }

  try {
    // Clean potential markdown blocks
    let cleanJson = rawResponse.trim()
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim()
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim()
    }

    const items = JSON.parse(cleanJson)
    if (Array.isArray(items)) {
      return items.map((item, idx) => ({
        id: `brainstorm_${Date.now()}_${idx}`,
        type: item.type === 'contra' ? 'contra' : 'pro',
        text: String(item.text || ''),
        suggestedWeight: Math.max(1, Math.min(10, Number(item.suggestedWeight) || 5)),
        rationale: String(item.rationale || ''),
      }))
    }
  } catch (e) {
    console.error('Failed to parse brainstorm JSON:', e, rawResponse)
  }

  throw new Error('Не удалось структурировать предложения AI в формат карточек. Попробуйте еще раз.')
}

export async function testApiConnection(settings: LLMSettings): Promise<{ success: boolean; message: string }> {
  try {
    if (settings.provider === 'gemini') {
      if (!settings.geminiApiKey) return { success: false, message: 'Введите API ключ Gemini' }
      const model = settings.geminiModel || 'gemini-2.5-flash'
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ответь словом "OK"' }] }],
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.error?.message || `Ошибка ${res.status}` }
      }
      return { success: true, message: 'Соединение с Google Gemini успешно!' }
    } else {
      if (!settings.openaiApiKey) return { success: false, message: 'Введите API ключ' }
      const baseUrl = (settings.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
      const model = settings.openaiModel || 'gpt-4o-mini'
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.openaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.error?.message || `Ошибка ${res.status}` }
      }
      return { success: true, message: 'Соединение успешно!' }
    }
  } catch (e: any) {
    return { success: false, message: e.message || 'Ошибка сети' }
  }
}
