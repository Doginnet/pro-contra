export interface Argument {
  id: string
  text: string
  weight: number // 1 to 10
  category?: string
}

export interface Decision {
  id: string
  title: string
  description: string
  pros: Argument[]
  cons: Argument[]
  createdAt: number
  updatedAt: number
}

export type LLMProvider = 'gemini' | 'openai-compatible'

export interface LLMSettings {
  provider: LLMProvider
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiBaseUrl: string
  openaiModel: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isError?: boolean
}

export interface BrainstormItem {
  id: string
  type: 'pro' | 'contra'
  text: string
  suggestedWeight: number
  rationale: string
}

export interface BalanceStats {
  proSum: number
  contraSum: number
  totalSum: number
  proPercent: number
  contraPercent: number
  diff: number
  verdict: 'pro' | 'contra' | 'equal'
}
