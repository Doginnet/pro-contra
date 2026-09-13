import React from 'react'
import { Scale, RotateCcw, Sparkles } from 'lucide-react'
import type { BalanceStats } from '../types'

interface BalanceFooterProps {
  stats: BalanceStats
  onClearBoard: () => void
  onOpenAiDrawer: () => void
}

export const BalanceFooter: React.FC<BalanceFooterProps> = ({
  stats,
  onClearBoard,
  onOpenAiDrawer,
}) => {
  const { proSum, contraSum, totalSum, proPercent, contraPercent, diff, verdict } = stats

  const getVerdictText = () => {
    if (totalSum === 0) return 'Add arguments to calculate decision balance'
    if (verdict === 'equal') return '⚖️ Absolute parity — forces are equal (50% / 50%)'
    if (verdict === 'pro') {
      return `🏆 Lean towards PRO by +${diff} ${diff === 1 ? 'pt' : 'pts'} (${proPercent}% vs ${contraPercent}%)`
    }
    return `⚠️ Lean towards CONTRA by ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'pt' : 'pts'} (${contraPercent}% vs ${proPercent}%)`
  }

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-6 py-3.5 flex-shrink-0 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Balance Bar & Metrics */}
        <div className="flex-1 w-full md:w-auto">
          {/* Top Row: Labels and Percentages */}
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                PRO: {proSum} pts ({totalSum > 0 ? proPercent : 0}%)
              </span>
            </div>

            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getVerdictText()}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">
                CONTRA: {contraSum} pts ({totalSum > 0 ? contraPercent : 0}%)
              </span>
            </div>
          </div>

          {/* Tug-of-War Bar */}
          <div className="relative h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-200 dark:border-zinc-800 shadow-inner">
            {/* Pro side */}
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${totalSum === 0 ? 50 : proPercent}%` }}
            />
            {/* Center tick indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-0.5 w-1 bg-white/80 dark:bg-black/60 z-10" />
            {/* Contra side */}
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-300 ease-out"
              style={{ width: `${totalSum === 0 ? 50 : contraPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Footer Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClearBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title="Clear all arguments on the board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onOpenAiDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deep Analysis</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
