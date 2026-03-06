import { useState } from 'react'
import { addParentTask } from '../utils/firestore'

export default function AddParentTaskModal({ onClose, userId }) {
    const [name, setName] = useState('')
    const [activeDays, setActiveDays] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const toggleDay = (day) => {
        setActiveDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const trimmedName = name.trim()

        if (!trimmedName) {
            setError('Name is required.')
            return
        }
        if (activeDays.length === 0) {
            setError('Please select at least one active day.')
            return
        }

        setLoading(true)
        setError('')
        try {
            await addParentTask(userId, { name: trimmedName, activeDays })
            onClose()
        } catch (err) {
            setError('Failed to add goal. Please try again.')
            console.error(err)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
            <div
                className="absolute inset-0 z-0"
                onClick={onClose}
            ></div>
            <div className="relative z-10 w-full max-w-md animate-[slideUp_0.3s_ease-out] rounded-t-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl sm:rounded-2xl pb-10 sm:pb-6">
                <h2 className="mb-6 font-display text-2xl font-[800] text-[var(--text-primary)]">New Goal</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="mb-2 block pl-1 text-[11px] font-[800] uppercase tracking-widest text-[var(--text-secondary)]">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Read 10 pages"
                            autoFocus
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3.5 text-base font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block pl-1 text-[11px] font-[800] uppercase tracking-widest text-[var(--text-secondary)]">
                            Active Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {allDays.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-sm font-[800] transition-all ${activeDays.includes(day)
                                            ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-[var(--bg-primary)] ring-2 ring-[var(--accent-green)]/30'
                                            : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm font-[800] text-[var(--accent-red)] animate-pulse">{error}</p>}

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-[var(--border)] py-3.5 font-[800] transition-colors hover:bg-[var(--bg-elevated)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-[2] items-center justify-center rounded-xl bg-[var(--accent-green)] py-3.5 font-[800] text-[var(--bg-primary)] transition-all hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
