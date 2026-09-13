import type { Decision, LLMSettings, ChatMessage, BrainstormItem } from '../types'
import { calculateBalance } from './storageService'

export function buildDecisionContextPrompt(decision: Decision): string {
  const stats = calculateBalance(decision)

  const prosList = decision.pros.length > 0
    ? decision.pros.map((p, i) => `  ${i + 1}. [Weight: ${p.weight}/10] ${p.text}`).join('\n')
    : '  (no PRO arguments added)'

  const consList = decision.cons.length > 0
    ? decision.cons.map((c, i) => `  ${i + 1}. [Weight: ${c.weight}/10] ${c.text}`).join('\n')
    : '  (no CONTRA arguments added)'

  return `[CURRENT DECISION CONTEXT]
Question / Dilemma: ${decision.title || 'Untitled'}
Context & Details: ${decision.description || 'Not provided'}

BALANCE OF FACTORS:
- Total PRO (For): ${stats.proSum} points (${stats.proPercent}%)
- Total CONTRA (Against): ${stats.contraSum} points (${stats.contraPercent}%)
- Spread: ${stats.diff > 0 ? `+${stats.diff} in favor of PRO` : stats.diff < 0 ? `${stats.diff} in favor of CONTRA` : 'Parity'}

ARGUMENTS FOR (PRO):
${prosList}

ARGUMENTS AGAINST (CONTRA):
${consList}
`
}

export const SYSTEM_PROMPT_ANALYST = `You are an elite strategic decision coach and rational analyst.
Your objective is to help the user objectively, rigorously, and thoroughly evaluate their Pro & Contra dilemma with 1-10 weighted arguments.

Core analysis principles:
1. Be concise, sharp, structured, and pragmatic. Cut out generic fluff.
2. Analyze not only the sum of weights, but also the qualitative asymmetry of risks (e.g. reversible decisions vs. irreversible one-way doors).
3. Scrutinize high-weight arguments (8-10) to verify whether they reflect ground truth or speculative anxiety.
4. Conclude with 1-2 probing, high-leverage questions that will give the user decisive clarity.
5. Format your response cleanly using Markdown (headers, bullet points, bold highlights).

LANGUAGE RULE:
Detect the language used by the user in their dilemma title, description, or questions, and ALWAYS respond in that same language (e.g., if the user wrote in Russian, respond in natural Russian; if in English, respond in English, etc.).
`

export const SYSTEM_PROMPT_DEVIL = `You are the Devil's Advocate and an expert in cognitive bias & risk mitigation.
Your mission is to relentlessly pressure-test the user's assumptions with constructive skepticism:
1. Expose blind spots and unchecked assumptions taken on faith.
2. Audit weights: identify potential optimism bias, loss aversion, status quo bias, or sunk cost fallacy.
3. Realistic Stress-Test (Pre-Mortem): "Fast-forward 6 months. What is the most plausible failure mode, and what subtle early warning signs were ignored?".
4. Actionable Risk Hedges: For each major risk identified, suggest a concrete safety net or hedge ("How to cap your downside").
5. Reality-Check Questions: Pose 2-3 sharp, sobering, and revealing questions.

LANGUAGE RULE:
Detect the language used by the user in their dilemma title, description, or questions, and ALWAYS respond in that same language (e.g., if the user wrote in Russian, respond in natural Russian; if in English, respond in English, etc.).
`

export const SYSTEM_PROMPT_VISIONARY = `You are the Visionary Strategist and "Opportunity Hunter" (The Angel's Advocate).
While others fixate on fear and status-quo comfort, your mission is to illuminate bold possibilities, hidden leverage, and breakthrough potential:
1. Asymmetric Upside: Identify where the downside is limited but the upside is exponential (skill compounding, network expansion, career optionality, life vitality).
2. Pre-Success Blueprint: "Fast-forward 2 years. This move proved to be one of the best decisions you ever made. What was the catalyst that unlocked this triumph?".
3. Reframing the Cons: Take the top fears/arguments from the CONTRA column and demonstrate how they can be systematically mitigated, delegated, or repurposed as competitive advantages.
4. The Bold MVP Step: What is the highest-conviction, low-risk micro-experiment or action that the user can take right now to build unstoppable momentum?
5. Inspiring & Grounded: Be visionary, energetic, and ambitious, while keeping advice rooted in pragmatic strategic execution.

LANGUAGE RULE:
Detect the language used by the user in their dilemma title, description, or questions, and ALWAYS respond in that same language (e.g., if the user wrote in Russian, respond in natural Russian; if in English, respond in English, etc.).
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
    throw new Error('Google Gemini API key is missing. Open Settings ⚙️ to enter your key.')
  }

  const model = settings.geminiModel || 'gemini-3.5-flash'
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
    const msg = errorData.error?.message || `HTTP Error ${response.status}: ${response.statusText}`
    throw new Error(`Gemini API: ${msg}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Gemini API did not return text content.')
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
    throw new Error('API key is missing. Open Settings ⚙️ to enter your key.')
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
    const msg = err.error?.message || `HTTP Error ${response.status}: ${response.statusText}`
    throw new Error(`API: ${msg}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content
  if (!answer) {
    throw new Error('API returned empty response.')
  }

  return answer
}

export async function brainstormArguments(
  decision: Decision,
  settings: LLMSettings
): Promise<BrainstormItem[]> {
  const context = buildDecisionContextPrompt(decision)
  const prompt = `You are an expert decision analyst.
Based on the dilemma and current board below, generate 3-4 strong overlooked PRO arguments (For) and 3-4 strong overlooked CONTRA arguments (Against).

CRITICAL LANGUAGE RULE: Write the "text" and "rationale" fields in the SAME LANGUAGE that the user used in their dilemma title and description.

RESPONSE FORMAT: Output ONLY a valid JSON array of objects without markdown fences or wrappers:
[
  {
    "type": "pro" | "contra",
    "text": "concise, sharp formulation of the argument (under 12 words)",
    "suggestedWeight": integer from 1 to 10,
    "rationale": "why this factor is significant (1 sentence)"
  }
]

${context}`

  let rawResponse = ''
  const systemInstruction = 'You are a structured argument generation engine. Always return strictly raw valid JSON array.'
  if (settings.provider === 'gemini') {
    rawResponse = await sendGeminiRequest([], prompt, systemInstruction, settings)
  } else {
    rawResponse = await sendOpenAIRequest([], prompt, systemInstruction, settings)
  }

  try {
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

  throw new Error('Failed to parse AI brainstorm recommendations into cards. Please try again.')
}

export async function testApiConnection(settings: LLMSettings): Promise<{ success: boolean; message: string }> {
  try {
    if (settings.provider === 'gemini') {
      if (!settings.geminiApiKey) return { success: false, message: 'Please enter a Gemini API Key' }
      const model = settings.geminiModel || 'gemini-3.5-flash'
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "OK"' }] }],
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.error?.message || `Error ${res.status}` }
      }
      return { success: true, message: 'Google Gemini connection successful!' }
    } else {
      if (!settings.openaiApiKey) return { success: false, message: 'Please enter an API Key' }
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
        return { success: false, message: err.error?.message || `Error ${res.status}` }
      }
      return { success: true, message: 'API connection successful!' }
    }
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error' }
  }
}
