export default function SubtaskRow({ subtask, onToggle, onDelete, today }) {
    const isDone = subtask.completedDates?.includes(today)

    return (
        <div
            onClick={() => onToggle(subtask.id, !isDone)}
            className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:bg-[var(--bg-elevated)] ${isDone
                    ? 'border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5'
                    : 'border-[var(--border)] bg-[var(--bg-card)]'
                }`}
        >
            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${isDone
                        ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-[var(--bg-primary)]'
                        : 'border-[var(--text-muted)] group-hover:border-[var(--text-secondary)] bg-transparent'
                    }`}
            >
                {isDone && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>

            <span className={`block flex-1 text-base transition-colors ${isDone ? 'font-medium text-[var(--accent-green)] line-through opacity-80' : 'font-bold text-[var(--text-primary)]'
                }`}>
                {subtask.name}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(subtask.id)
                }}
                className="opacity-0 transition-opacity group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-[var(--accent-red)] active:scale-95"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    )
}
