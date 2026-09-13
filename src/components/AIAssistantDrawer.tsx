import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Sparkles,
  Send,
  RotateCcw,
  Flame,
  Lightbulb,
  ShieldAlert,
  Plus,
  Loader2,
  Bot,
  User,
  Settings,
} from 'lucide-react'
import type { Decision, LLMSettings, ChatMessage, BrainstormItem } from '../types'
import {
  sendChatMessage,
  brainstormArguments,
  SYSTEM_PROMPT_ANALYST,
  SYSTEM_PROMPT_DEVIL,
} from '../services/llmService'

interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
  decision: Decision
  settings: LLMSettings
  onOpenSettings: () => void
  onAddArgumentFromBrainstorm: (type: 'pro' | 'contra', text: string, weight: number) => void
  chatHistory: ChatMessage[]
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  decision,
  settings,
  onOpenSettings,
  onAddArgumentFromBrainstorm,
  chatHistory,
  setChatHistory,
}) => {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string>('')
  const [brainstormItems, setBrainstormItems] = useState<BrainstormItem[]>([])
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [chatHistory, isOpen, brainstormItems])

  // Clear current ephemeral chat
  const handleClearChat = () => {
    setChatHistory([])
    setBrainstormItems([])
  }

  // Generic message sender
  const handleSendMessage = async (textToSend: string, customSystemPrompt?: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    }

    const updatedHistory = [...chatHistory, userMessage]
    setChatHistory(updatedHistory)
    setInputText('')
    setIsLoading(true)
    setLoadingAction('Генерация ответа...')

    try {
      const reply = await sendChatMessage(
        chatHistory,
        textToSend,
        decision,
        settings,
        customSystemPrompt || SYSTEM_PROMPT_ANALYST
      )

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      }

      setChatHistory([...updatedHistory, assistantMessage])
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `⚠️ ${error.message || 'Произошла непредвиденная ошибка при запросе к AI.'}`,
        timestamp: Date.now(),
        isError: true,
      }
      setChatHistory([...updatedHistory, errorMessage])
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  // Action: Deep Analysis
  const handleRunAnalysis = () => {
    const prompt = 'Проведи всесторонний стратегический анализ этого решения. Дай четкий вердикт, оцени веса ключевых аргументов и подсвети скрытые риски.'
    handleSendMessage(prompt, SYSTEM_PROMPT_ANALYST)
  }

  // Action: Devil's Advocate
  const handleRunDevilsAdvocate = () => {
    const prompt = 'Включи режим «Адвоката дьявола». Разнеси мои предположения, найди когнитивные искажения и задай самые неудобные отрезвляющие вопросы.'
    handleSendMessage(prompt, SYSTEM_PROMPT_DEVIL)
  }

  // Action: Brainstorm Arguments
  const handleRunBrainstorm = async () => {
    if (isLoading) return
    setIsLoading(true)
    setLoadingAction('AI подбирает неочевидные аргументы «За» и «Против»...')
    try {
      const items = await brainstormArguments(decision, settings)
      setBrainstormItems(items)

      // Add a helpful note in chat
      setChatHistory((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_brainstorm`,
          role: 'assistant',
          content: `💡 Я сгенерировал **${items.length}** потенциальных аргументов ниже. Вы можете добавить подходящие в 1 клик на свою доску:`,
          timestamp: Date.now(),
        },
      ])
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          role: 'assistant',
          content: `⚠️ Не удалось выполнить Brainstorm: ${error.message}`,
          timestamp: Date.now(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  const handleAddBrainstormCard = (item: BrainstormItem) => {
    onAddArgumentFromBrainstorm(item.type, item.text, item.suggestedWeight)
    setAddedItemIds((prev) => new Set(prev).add(item.id))
  }

  const isKeyConfigured =
    settings.provider === 'gemini' ? !!settings.geminiApiKey : !!settings.openaiApiKey

  const activeModelDisplay =
    settings.provider === 'gemini'
      ? settings.geminiModel || 'gemini-2.5-flash'
      : settings.openaiModel || 'gpt-4o-mini'

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] md:w-[520px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>AI Decision Advisor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal">
                {activeModelDisplay}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Временная сессия • стирается при сбросе
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Очистить текущий диалог"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Закрыть панель"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning if API Key is missing */}
      {!isKeyConfigured && (
        <div className="m-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>API ключ не указан. Задайте ключ для работы ассистента.</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-zinc-950 font-semibold rounded-lg text-[11px] hover:bg-amber-400 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Настройки</span>
          </button>
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="px-5 py-3 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20 flex flex-wrap gap-2">
        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Глубокий анализ</span>
        </button>

        <button
          onClick={handleRunBrainstorm}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Brainstorm аргументов</span>
        </button>

        <button
          onClick={handleRunDevilsAdvocate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all shadow-sm"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Адвокат дьявола</span>
        </button>
      </div>

      {/* Messages Thread & Brainstorm items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatHistory.length === 0 && brainstormItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3 border border-violet-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              Готов к анализу вашей дилеммы
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed mb-4">
              Нажмите кнопку выше или задайте любой вопрос. Вся информация из таблицы «За» и «Против» уже загружена в контекст.
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg bg-violet-600/15 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-violet-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-3.5 max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : msg.isError
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-tl-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                  {msg.content}
                </div>
                <div
                  className={`text-[9px] mt-1.5 font-mono ${
                    msg.role === 'user' ? 'text-white/60 text-right' : 'text-zinc-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Brainstorm cards tray */}
        {brainstormItems.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Предложенные аргументы:</span>
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {brainstormItems.map((item) => {
                const isAdded = addedItemIds.has(item.id)
                const isPro = item.type === 'pro'
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 transition-all ${
                      isPro
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isPro
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPro ? 'PRO (ЗА)' : 'CONTRA (ПРОТИВ)'} • {item.suggestedWeight}/10
                          </span>
                        </div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.text}</p>
                        {item.rationale && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                            {item.rationale}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddBrainstormCard(item)}
                        disabled={isAdded}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${
                          isAdded
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-default'
                            : isPro
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAdded ? 'Добавлено' : 'В список'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 bg-violet-500/5 p-3 rounded-xl border border-violet-500/10 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingAction || 'Генерация ответа...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(inputText)
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading || !isKeyConfigured}
            placeholder={
              !isKeyConfigured
                ? 'Сначала укажите API ключ в настройках...'
                : 'Задайте вопрос или уточнение для продолжения диалога...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || !isKeyConfigured}
            className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            title="Отправить сообщение"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
