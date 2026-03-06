export default function ParentTaskCard({ task, onClick, onDelete }) {
    const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    const isActiveToday = task.activeDays?.includes(todayShort)

    return (
        <div
            onClick={() => onClick(task)}
            className={`relative flex cursor-pointer flex-col gap-3 rounded-[12px] border border-[var(--border,#1e1e1e)] bg-[var(--bg-card,#111111)] p-4 transition-colors hover:bg-[var(--bg-elevated,#1a1a1a)] ${isActiveToday ? 'opacity-100' : 'opacity-[0.4]'}`}
            style={{ animation: 'fadeUp 300ms ease-out both' }}
        >
            <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-bold text-[var(--text-primary,#e8e8e8)] pr-12">{task.name}</h3>

                {/* Streak Badge */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--accent-green,#00ff88)]/10 px-3 py-1.5 text-[var(--accent-green,#00ff88)] shrink-0">
                    <span className="font-mono text-xl font-bold leading-none flex items-center gap-1">
                        <span className="text-base">🔥</span> {task.streakCount || 0}
                    </span>
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-widest opacity-80">Streak</span>
                </div>
            </div>

            {/* Active Days Chips */}
            <div className="mt-2 flex gap-1.5">
                {allDays.map(day => {
                    const isActiveForTask = task.activeDays?.includes(day)
                    const isToday = day === todayShort

                    let chipClass = "flex h-5 w-[22px] items-center justify-center rounded-full text-[10px] font-bold transition-colors "

                    if (isActiveForTask) {
                        chipClass += "bg-[var(--accent-green,#00ff88)] text-[var(--bg-primary,#0a0a0a)] "
                        if (isToday) chipClass += "ring-2 ring-[var(--text-primary,#e8e8e8)] ring-offset-1 ring-offset-[var(--bg-card,#111111)] "
                    } else {
                        chipClass += "bg-[#333] text-[#888] "
                    }

                    return (
                        <div key={day} className={chipClass}>
                            {day.charAt(0)}
                        </div>
                    )
                })}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                }}
                className="absolute bottom-4 right-4 p-1.5 text-[var(--text-muted,#444444)] transition-colors hover:text-[var(--accent-red,#ff3f6c)]"
            >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    )
}
