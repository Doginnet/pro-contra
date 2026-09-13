import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { SplitBoard } from './components/SplitBoard'
import { BalanceFooter } from './components/BalanceFooter'
import { AIAssistantDrawer } from './components/AIAssistantDrawer'
import { SettingsModal } from './components/SettingsModal'
import { DecisionsListModal } from './components/DecisionsListModal'
import {
  loadAllDecisions,
  saveAllDecisions,
  getActiveDecisionId,
  setActiveDecisionId,
  createNewDecision,
  loadSettings,
  saveSettings,
  loadTheme,
  saveTheme,
  calculateBalance,
  formatDecisionToMarkdown,
  exportFile,
} from './services/storageService'
import type { Decision, LLMSettings, ChatMessage } from './types'

export function App() {
  const [decisions, setDecisions] = useState<Decision[]>(() => loadAllDecisions())
  const [activeDecisionId, setActiveId] = useState<string>(() => {
    const saved = getActiveDecisionId()
    const all = loadAllDecisions()
    if (saved && all.some((d) => d.id === saved)) return saved
    return all[0]?.id || ''
  })

  const [settings, setSettings] = useState<LLMSettings>(() => loadSettings())
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme())

  // Ephemeral AI Chat History for the active session
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  // Modal / Drawer visibility
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDecisionsListOpen, setIsDecisionsListOpen] = useState(false)

  // Current active decision
  const activeDecision = decisions.find((d) => d.id === activeDecisionId) || decisions[0]

  // Synchronize decisions to localStorage on update
  useEffect(() => {
    if (decisions.length > 0) {
      saveAllDecisions(decisions)
    }
  }, [decisions])

  // Synchronize active ID
  useEffect(() => {
    if (activeDecisionId) {
      setActiveDecisionId(activeDecisionId)
    }
  }, [activeDecisionId])

  // Theme switcher effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    saveTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Helper to update active decision
  const updateCurrentDecision = (updater: (prev: Decision) => Decision) => {
    setDecisions((prevDecisions) =>
      prevDecisions.map((d) => {
        if (d.id === activeDecisionId) {
          return { ...updater(d), updatedAt: Date.now() }
        }
        return d
      })
    )
  }

  const handleUpdateTitle = (title: string) => {
    updateCurrentDecision((d) => ({ ...d, title }))
  }

  const handleUpdateDescription = (description: string) => {
    updateCurrentDecision((d) => ({ ...d, description }))
  }

  // Arguments management
  const handleAddArgument = (type: 'pro' | 'contra', text: string, weight: number) => {
    const newArg = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      weight,
    }
    updateCurrentDecision((d) => ({
      ...d,
      pros: type === 'pro' ? [...d.pros, newArg] : d.pros,
      cons: type === 'contra' ? [...d.cons, newArg] : d.cons,
    }))
  }

  const handleUpdateArgumentText = (type: 'pro' | 'contra', id: string, text: string) => {
    updateCurrentDecision((d) => ({
      ...d,
      pros: type === 'pro' ? d.pros.map((p) => (p.id === id ? { ...p, text } : p)) : d.pros,
      cons: type === 'contra' ? d.cons.map((c) => (c.id === id ? { ...c, text } : c)) : d.cons,
    }))
  }

  const handleUpdateArgumentWeight = (type: 'pro' | 'contra', id: string, weight: number) => {
    updateCurrentDecision((d) => ({
      ...d,
      pros: type === 'pro' ? d.pros.map((p) => (p.id === id ? { ...p, weight } : p)) : d.pros,
      cons: type === 'contra' ? d.cons.map((c) => (c.id === id ? { ...c, weight } : c)) : d.cons,
    }))
  }

  const handleDeleteArgument = (type: 'pro' | 'contra', id: string) => {
    updateCurrentDecision((d) => ({
      ...d,
      pros: type === 'pro' ? d.pros.filter((p) => p.id !== id) : d.pros,
      cons: type === 'contra' ? d.cons.filter((c) => c.id !== id) : d.cons,
    }))
  }

  const handleClearBoard = () => {
    if (confirm('Очистить все аргументы "За" и "Против" для этой дилеммы?')) {
      updateCurrentDecision((d) => ({
        ...d,
        pros: [],
        cons: [],
      }))
    }
  }

  // Decision Lifecycle
  const handleNewDecision = () => {
    const fresh = createNewDecision()
    setDecisions((prev) => [fresh, ...prev])
    setActiveId(fresh.id)
    setChatHistory([]) // Ephemeral chat reset for fresh dilemma
  }

  const handleSelectDecision = (id: string) => {
    setActiveId(id)
    setChatHistory([]) // Fresh session context
  }

  const handleDeleteDecision = (id: string) => {
    if (decisions.length <= 1) return
    const remaining = decisions.filter((d) => d.id !== id)
    setDecisions(remaining)
    if (activeDecisionId === id) {
      setActiveId(remaining[0].id)
      setChatHistory([])
    }
  }

  const handleSaveSettings = (newSettings: LLMSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  // Export
  const handleExportMarkdown = async () => {
    if (!activeDecision) return
    const md = formatDecisionToMarkdown(activeDecision)
    const sanitizedTitle = (activeDecision.title || 'decision')
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, '_')
      .substring(0, 30)
    const filename = `procontra_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.md`
    await exportFile(md, filename, 'md')
  }

  const stats = activeDecision ? calculateBalance(activeDecision) : {
    proSum: 0,
    contraSum: 0,
    totalSum: 0,
    proPercent: 50,
    contraPercent: 50,
    diff: 0,
    verdict: 'equal' as const,
  }

  if (!activeDecision) return null

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans select-none transition-colors">
      {/* Top Header */}
      <Header
        decision={activeDecision}
        onUpdateTitle={handleUpdateTitle}
        onUpdateDescription={handleUpdateDescription}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDecisionsList={() => setIsDecisionsListOpen(true)}
        onNewDecision={handleNewDecision}
        onToggleAiDrawer={() => setIsAiDrawerOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportMarkdown={handleExportMarkdown}
        savedDecisionsCount={decisions.length}
      />

      {/* Center Pro / Contra Split Board */}
      <SplitBoard
        pros={activeDecision.pros}
        cons={activeDecision.cons}
        proSum={stats.proSum}
        contraSum={stats.contraSum}
        onAddArgument={handleAddArgument}
        onUpdateArgumentText={handleUpdateArgumentText}
        onUpdateArgumentWeight={handleUpdateArgumentWeight}
        onDeleteArgument={handleDeleteArgument}
        onOpenBrainstorm={() => {
          setIsAiDrawerOpen(true)
        }}
      />

      {/* Bottom Comparison & Balance Bar */}
      <BalanceFooter
        stats={stats}
        onClearBoard={handleClearBoard}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
      />

      {/* AI Assistant Drawer (Right Slide-out) */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        decision={activeDecision}
        settings={settings}
        onOpenSettings={() => {
          setIsAiDrawerOpen(false)
          setIsSettingsOpen(true)
        }}
        onAddArgumentFromBrainstorm={handleAddArgument}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Saved Decisions List Modal */}
      <DecisionsListModal
        isOpen={isDecisionsListOpen}
        onClose={() => setIsDecisionsListOpen(false)}
        decisions={decisions}
        activeDecisionId={activeDecisionId}
        onSelectDecision={handleSelectDecision}
        onNewDecision={handleNewDecision}
        onDeleteDecision={handleDeleteDecision}
      />
    </div>
  )
}

export default App
