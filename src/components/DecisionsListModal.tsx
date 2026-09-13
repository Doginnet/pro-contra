import React from 'react'
import { X, FolderKanban, Plus, Trash2, ArrowRight } from 'lucide-react'
import type { Decision } from '../types'
import { calculateBalance } from '../services/storageService'

interface DecisionsListModalProps {
  isOpen: boolean
  onClose: () => void
  decisions: Decision[]
  activeDecisionId: string
  onSelectDecision: (id: string) => void
  onNewDecision: () => void
  onDeleteDecision: (id: string) => void
}

export const DecisionsListModal: React.FC<DecisionsListModalProps> = ({
  isOpen,
  onClose,
  decisions,
  activeDecisionId,
  onSelectDecision,
  onNewDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Saved Decisions ({decisions.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewDecision()
                onClose()
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Decisions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {decisions.map((item) => {
            const isActive = item.id === activeDecisionId
            const stats = calculateBalance(item)
            const dateStr = new Date(item.updatedAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-violet-500/50 bg-violet-500/5 dark:bg-violet-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title || 'Untitled Decision'}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-2">
                        {item.description}
                      </p>
                    )}

                    {/* Stats summary row */}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        PRO: {stats.proSum}
                      </span>
                      <span>vs</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        CONTRA: {stats.contraSum}
                      </span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isActive && (
                      <button
                        onClick={() => {
                          onSelectDecision(item.id)
                          onClose()
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {decisions.length > 1 && (
                      <button
                        onClick={() => onDeleteDecision(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete this decision"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
