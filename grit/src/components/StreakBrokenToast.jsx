import { useEffect, useRef } from 'react'

export default function StreakBrokenToast({ brokenTasks, clearTask }) {
  const currentTask = brokenTasks[0] ?? null
  const clearTaskRef = useRef(clearTask)

  useEffect(() => {
    clearTaskRef.current = clearTask
  }, [clearTask])

  useEffect(() => {
    if (!currentTask) return

    const timer = setTimeout(() => {
      clearTaskRef.current(currentTask.id)
    }, 3500)

    return () => clearTimeout(timer)
  }, [currentTask])

  if (!currentTask) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--accent-red,#ff3f6c)] bg-[var(--bg-elevated,#1a1a1a)] px-4 py-3 shadow-2xl shadow-[var(--accent-red)]/20">
        <span className="text-2xl drop-shadow-md">💀</span>
        <div>
          <p className="text-[13px] font-[800] uppercase tracking-wider text-[var(--accent-red,#ff3f6c)]">
            Streak Broken
          </p>
          <p className="max-w-[200px] truncate text-sm font-medium text-[var(--text-primary,#e8e8e8)]">
            {currentTask.name}
          </p>
        </div>
      </div>
    </div>
  )
}
