import React from 'react'
import { Trash2 } from 'lucide-react'
import type { Argument } from '../types'

interface ArgumentCardProps {
  argument: Argument
  type: 'pro' | 'contra'
  index: number
  onUpdateText: (id: string, text: string) => void
  onUpdateWeight: (id: string, weight: number) => void
  onDelete: (id: string) => void
}

export const ArgumentCard: React.FC<ArgumentCardProps> = ({
  argument,
  type,
  index,
  onUpdateText,
  onUpdateWeight,
  onDelete,
}) => {
  const isPro = type === 'pro'

  // Helper label based on weight
  const getWeightLabel = (w: number) => {
    if (w <= 3) return 'Незначительный'
    if (w <= 6) return 'Умеренный'
    if (w <= 8) return 'Важный'
    return 'Критический'
  }

  return (
    <div
      className={`group relative p-3 rounded-xl border transition-all duration-150 ${
        isPro
          ? 'bg-zinc-50/70 dark:bg-zinc-900/60 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm hover:shadow-emerald-500/5'
          : 'bg-zinc-50/70 dark:bg-zinc-900/60 border-rose-500/20 hover:border-rose-500/40 hover:shadow-sm hover:shadow-rose-500/5'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Number bullet */}
        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 select-none w-4 text-right">
          {index + 1}.
        </span>

        {/* Text Input */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={argument.text}
            onChange={(e) => onUpdateText(argument.id, e.target.value)}
            placeholder={isPro ? 'Опишите довод "ЗА"...' : 'Опишите довод "ПРОТИВ"...'}
            className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
          />

          {/* Slider and Weight Info */}
          <div className="flex items-center gap-3 mt-2.5">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={argument.weight}
              onChange={(e) => onUpdateWeight(argument.id, parseInt(e.target.value, 10))}
              className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isPro
                  ? 'accent-emerald-500 bg-emerald-950/30 dark:bg-emerald-950/50'
                  : 'accent-rose-500 bg-rose-950/30 dark:bg-rose-950/50'
              }`}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                  isPro
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {argument.weight}/10
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                {getWeightLabel(argument.weight)}
              </span>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(argument.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 rounded transition-all"
          title="Удалить аргумент"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
