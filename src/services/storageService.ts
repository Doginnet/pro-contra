import type { Decision, LLMSettings, BalanceStats } from '../types'

const SETTINGS_KEY = 'procontra_llm_settings'
const DECISIONS_KEY = 'procontra_decisions'
const ACTIVE_ID_KEY = 'procontra_active_id'
const THEME_KEY = 'procontra_theme'

export const DEFAULT_SETTINGS: LLMSettings = {
  provider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-3.5-flash',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
}

export function loadSettings(): LLMSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    if (parsed.geminiModel && (parsed.geminiModel.includes('2.5') || parsed.geminiModel.includes('1.5'))) {
      parsed.geminiModel = 'gemini-3.5-flash'
    }
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: LLMSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function createNewDecision(title = 'Новое решение', description = ''): Decision {
  return {
    id: `decision_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    description,
    pros: [
      { id: 'p1', text: 'Высокий потенциал роста и развития', weight: 8 },
      { id: 'p2', text: 'Увеличение дохода и стабильность', weight: 7 },
    ],
    cons: [
      { id: 'c1', text: 'Высокий уровень стресса и ответственности', weight: 6 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function loadAllDecisions(): Decision[] {
  try {
    const raw = localStorage.getItem(DECISIONS_KEY)
    if (!raw) {
      const initial = createNewDecision(
        'Переход на новую работу',
        'Стоит ли принять оффер от международной продуктовой компании с релокацией?'
      )
      saveAllDecisions([initial])
      setActiveDecisionId(initial.id)
      return [initial]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createNewDecision()]
  } catch {
    const fallback = createNewDecision()
    saveAllDecisions([fallback])
    return [fallback]
  }
}

export function saveAllDecisions(decisions: Decision[]): void {
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions))
}

export function getActiveDecisionId(): string | null {
  return localStorage.getItem(ACTIVE_ID_KEY)
}

export function setActiveDecisionId(id: string): void {
  localStorage.setItem(ACTIVE_ID_KEY, id)
}

export function loadTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function calculateBalance(decision: Decision): BalanceStats {
  const proSum = decision.pros.reduce((acc, item) => acc + (Number(item.weight) || 0), 0)
  const contraSum = decision.cons.reduce((acc, item) => acc + (Number(item.weight) || 0), 0)
  const totalSum = proSum + contraSum

  let proPercent = 50
  let contraPercent = 50

  if (totalSum > 0) {
    proPercent = Math.round((proSum / totalSum) * 100)
    contraPercent = 100 - proPercent
  }

  const diff = proSum - contraSum
  let verdict: 'pro' | 'contra' | 'equal' = 'equal'
  if (diff > 0) verdict = 'pro'
  else if (diff < 0) verdict = 'contra'

  return {
    proSum,
    contraSum,
    totalSum,
    proPercent,
    contraPercent,
    diff,
    verdict,
  }
}

export function formatDecisionToMarkdown(decision: Decision): string {
  const stats = calculateBalance(decision)
  const dateStr = new Date(decision.updatedAt).toLocaleString('ru-RU')

  let md = `# ${decision.title || 'Без названия'}\n\n`
  if (decision.description) {
    md += `> **Описание/Контекст:**\n> ${decision.description.split('\n').join('\n> ')}\n\n`
  }

  md += `*Дата анализа:* ${dateStr}\n\n`
  md += `## ⚖️ Итоговый баланс\n`
  md += `- **Баллы PRO (За):** ${stats.proSum} (${stats.proPercent}%)\n`
  md += `- **Баллы CONTRA (Против):** ${stats.contraSum} (${stats.contraPercent}%)\n`
  md += `- **Разница:** ${stats.diff > 0 ? `+${stats.diff} в пользу PRO` : stats.diff < 0 ? `${stats.diff} в пользу CONTRA` : 'Абсолютный паритет (0)'}\n\n`

  md += `### ✅ Аргументы «ЗА» (PRO)\n`
  if (decision.pros.length === 0) {
    md += `_Нет добавленных аргументов_\n`
  } else {
    decision.pros.forEach((p, idx) => {
      md += `${idx + 1}. **[${p.weight}/10]** ${p.text}\n`
    })
  }

  md += `\n### ❌ Аргументы «ПРОТИВ» (CONTRA)\n`
  if (decision.cons.length === 0) {
    md += `_Нет добавленных аргументов_\n`
  } else {
    decision.cons.forEach((c, idx) => {
      md += `${idx + 1}. **[${c.weight}/10]** ${c.text}\n`
    })
  }

  md += `\n---\n*Сформировано в приложении ProContra Desktop*\n`
  return md
}

export async function exportFile(content: string, filename: string, extension: 'md' | 'json'): Promise<boolean> {
  // Check if Electron native IPC dialog is available
  if (window && (window as any).electronAPI && typeof (window as any).electronAPI.saveFile === 'function') {
    try {
      const res = await (window as any).electronAPI.saveFile({
        defaultPath: filename,
        content,
        extension,
      })
      return res?.success || false
    } catch (e) {
      console.error('Electron save dialog failed, fallback to browser download:', e)
    }
  }

  // Browser download fallback
  try {
    const blob = new Blob([content], { type: extension === 'json' ? 'application/json' : 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('Download error:', err)
    return false
  }
}
