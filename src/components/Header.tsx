import React from 'react'
import { Sparkles, Settings as SettingsIcon, Sun, Moon, Plus, FolderKanban, Download } from 'lucide-react'
import type { Decision } from '../types'

interface HeaderProps {
  decision: Decision
  onUpdateTitle: (title: string) => void
  onUpdateDescription: (description: string) => void
  onOpenSettings: () => void
  onOpenDecisionsList: () => void
  onNewDecision: () => void
  onToggleAiDrawer: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onExportMarkdown: () => void
  savedDecisionsCount: number
}

export const Header: React.FC<HeaderProps> = ({
  decision,
  onUpdateTitle,
  onUpdateDescription,
  onOpenSettings,
  onOpenDecisionsList,
  onNewDecision,
  onToggleAiDrawer,
  theme,
  onToggleTheme,
  onExportMarkdown,
  savedDecisionsCount,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex-shrink-0 transition-colors">
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* Brand & Decision Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-300">
            <span className="text-emerald-500 font-black">PRO</span>
            <span className="text-zinc-400">/</span>
            <span className="text-rose-500 font-black">CONTRA</span>
          </div>

          <button
            onClick={onOpenDecisionsList}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title="Open saved decisions list"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Decisions ({savedDecisionsCount})</span>
          </button>

          <button
            onClick={onNewDecision}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Create a new decision"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
            title="Export summary to Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={onToggleAiDrawer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm shadow-indigo-500/20 active:scale-98 transition-all"
            title="Open AI Decision Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>ASK AGENT</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="LLM & API Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dilemma Input */}
      <div className="space-y-1.5">
        <input
          type="text"
          value={decision.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="State your dilemma, question, or key decision..."
          className="w-full text-xl font-semibold bg-transparent text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 py-0.5 transition-colors"
        />

        <textarea
          rows={1}
          value={decision.description}
          onChange={(e) => onUpdateDescription(e.target.value)}
          placeholder="Describe context, constraints, trade-offs, or goals (optional)..."
          className="w-full text-xs text-zinc-600 dark:text-zinc-400 bg-transparent placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none focus:text-zinc-900 dark:focus:text-zinc-200 transition-colors"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
        />
      </div>
    </header>
  )
}
