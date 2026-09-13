import React, { useState } from 'react'
import { Plus, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import type { Argument } from '../types'
import { ArgumentCard } from './ArgumentCard'

interface SplitBoardProps {
  pros: Argument[]
  cons: Argument[]
  proSum: number
  contraSum: number
  onAddArgument: (type: 'pro' | 'contra', text: string, weight: number) => void
  onUpdateArgumentText: (type: 'pro' | 'contra', id: string, text: string) => void
  onUpdateArgumentWeight: (type: 'pro' | 'contra', id: string, weight: number) => void
  onDeleteArgument: (type: 'pro' | 'contra', id: string) => void
  onOpenBrainstorm: () => void
}

export const SplitBoard: React.FC<SplitBoardProps> = ({
  pros,
  cons,
  proSum,
  contraSum,
  onAddArgument,
  onUpdateArgumentText,
  onUpdateArgumentWeight,
  onDeleteArgument,
  onOpenBrainstorm,
}) => {
  const [newProText, setNewProText] = useState('')
  const [newProWeight, setNewProWeight] = useState(5)

  const [newContraText, setNewContraText] = useState('')
  const [newContraWeight, setNewContraWeight] = useState(5)

  const handleAddPro = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newProText.trim()) return
    onAddArgument('pro', newProText.trim(), newProWeight)
    setNewProText('')
    setNewProWeight(5)
  }

  const handleAddContra = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newContraText.trim()) return
    onAddArgument('contra', newContraText.trim(), newContraWeight)
    setNewContraText('')
    setNewContraWeight(5)
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto h-full">
        {/* ================= PRO COLUMN ================= */}
        <div className="flex flex-col h-full bg-white/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/70 rounded-2xl p-4 shadow-sm">
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 dark:text-zinc-100">
                PRO • Reasons For
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                {pros.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Sum:</span>
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {proSum}
              </span>
            </div>
          </div>

          {/* Quick Add Pro Form */}
          <form onSubmit={handleAddPro} className="mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newProText}
                onChange={(e) => setNewProText(e.target.value)}
                placeholder="Add a PRO reason..."
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newProText.trim()}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {newProText.trim() && (
              <div className="flex items-center gap-3 px-1 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Initial weight:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newProWeight}
                  onChange={(e) => setNewProWeight(parseInt(e.target.value, 10))}
                  className="flex-1 h-1.5 accent-emerald-500 bg-emerald-950/30 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 w-8 text-right">
                  {newProWeight}/10
                </span>
              </div>
            )}
          </form>

          {/* Pros List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
            {pros.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  No PRO arguments added yet
                </p>
                <button
                  onClick={onOpenBrainstorm}
                  className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Brainstorm with AI</span>
                </button>
              </div>
            ) : (
              pros.map((p, idx) => (
                <ArgumentCard
                  key={p.id}
                  argument={p}
                  type="pro"
                  index={idx}
                  onUpdateText={(id, text) => onUpdateArgumentText('pro', id, text)}
                  onUpdateWeight={(id, weight) => onUpdateArgumentWeight('pro', id, weight)}
                  onDelete={(id) => onDeleteArgument('pro', id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ================= CONTRA COLUMN ================= */}
        <div className="flex flex-col h-full bg-white/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/70 rounded-2xl p-4 shadow-sm">
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-900 dark:text-zinc-100">
                CONTRA • Reasons Against
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium font-mono">
                {cons.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Sum:</span>
              <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                {contraSum}
              </span>
            </div>
          </div>

          {/* Quick Add Contra Form */}
          <form onSubmit={handleAddContra} className="mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newContraText}
                onChange={(e) => setNewContraText(e.target.value)}
                placeholder="Add a CONTRA reason..."
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newContraText.trim()}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {newContraText.trim() && (
              <div className="flex items-center gap-3 px-1 py-1 bg-rose-500/5 rounded-lg border border-rose-500/10">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Initial weight:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newContraWeight}
                  onChange={(e) => setNewContraWeight(parseInt(e.target.value, 10))}
                  className="flex-1 h-1.5 accent-rose-500 bg-rose-950/30 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 w-8 text-right">
                  {newContraWeight}/10
                </span>
              </div>
            )}
          </form>

          {/* Cons List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
            {cons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  No CONTRA arguments added yet
                </p>
                <button
                  onClick={onOpenBrainstorm}
                  className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Brainstorm with AI</span>
                </button>
              </div>
            ) : (
              cons.map((c, idx) => (
                <ArgumentCard
                  key={c.id}
                  argument={c}
                  type="contra"
                  index={idx}
                  onUpdateText={(id, text) => onUpdateArgumentText('contra', id, text)}
                  onUpdateWeight={(id, weight) => onUpdateArgumentWeight('contra', id, weight)}
                  onDelete={(id) => onDeleteArgument('contra', id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
