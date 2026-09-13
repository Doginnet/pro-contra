import React, { useState } from 'react'
import { X, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Globe, Cpu, ExternalLink } from 'lucide-react'
import type { LLMSettings, LLMProvider } from '../types'
import { testApiConnection } from '../services/llmService'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: LLMSettings
  onSave: (settings: LLMSettings) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<LLMSettings>({ ...settings })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const handleProviderChange = (provider: LLMProvider) => {
    setForm((prev) => ({ ...prev, provider }))
    setTestResult(null)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const res = await testApiConnection(form)
    setTestResult(res)
    setIsTesting(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              LLM Provider Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
              Select Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  form.provider === 'gemini'
                    ? 'border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-300'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Google Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openai-compatible')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  form.provider === 'openai-compatible'
                    ? 'border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-300'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>OpenAI Compatible</span>
              </button>
            </div>
          </div>

          {/* Gemini Form */}
          {form.provider === 'gemini' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Google AI Studio API Key:
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={form.geminiApiKey}
                    onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pr-9 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Gemini Model:
                </label>
                <input
                  type="text"
                  value={form.geminiModel}
                  onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}
                  placeholder="gemini-3.5-flash"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'gemini-3.5-flash-lite', label: '3.5-flash-lite (economy)', desc: 'Fast & Cheap' },
                    { id: 'gemini-3.5-flash', label: '3.5-flash (balanced)', desc: 'Recommended' },
                    { id: 'gemini-3.8-flash', label: '3.8-flash (latest)', desc: 'Flagship Speed' },
                    { id: 'gemini-3.5-pro', label: '3.5-pro (deep reasoning)', desc: 'Complex Decisions' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setForm({ ...form, geminiModel: preset.id })}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                        form.geminiModel === preset.id
                          ? 'border-violet-600 bg-violet-600/15 text-violet-700 dark:text-violet-300 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OpenAI-Compatible Form */}
          {form.provider === 'openai-compatible' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  API Base URL:
                </label>
                <input
                  type="text"
                  value={form.openaiBaseUrl}
                  onChange={(e) => setForm({ ...form, openaiBaseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  For local Ollama: http://localhost:11434/v1 • For OpenRouter: https://openrouter.ai/api/v1
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  API Key:
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={form.openaiApiKey}
                    onChange={(e) => setForm({ ...form, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pr-9 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Model Identifier (Model ID):
                </label>
                <input
                  type="text"
                  value={form.openaiModel}
                  onChange={(e) => setForm({ ...form, openaiModel: e.target.value })}
                  placeholder="gpt-4o-mini or deepseek-chat or llama3"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Connection Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="truncate">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
