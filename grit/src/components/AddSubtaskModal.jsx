import { useState } from 'react'
import { addSubtask } from '../utils/firestore'

export default function AddSubtaskModal({ onClose, userId, parentId }) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const trimmedName = name.trim()

        if (!trimmedName) {
            setError('Name is required.')
            return
        }

        setLoading(true)
        setError('')
        try {
            await addSubtask(userId, parentId, { name: trimmedName })
            onClose()
        } catch (err) {
            setError('Failed to add subtask. Please try again.')
            console.error(err)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
            <div className="absolute inset-0 z-0" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-md animate-[slideUp_0.3s_ease-out] rounded-t-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl sm:rounded-2xl pb-10 sm:pb-6">
                <h2 className="mb-6 font-display text-2xl font-[800] text-[var(--text-primary)]">New Subtask</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="mb-2 block pl-1 text-[11px] font-[800] uppercase tracking-widest text-[var(--text-secondary)]">
                            Subtask Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Do 20 pushups"
                            autoFocus
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3.5 text-base font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                        />
                        {error && <p className="mt-3 text-sm font-[800] text-[var(--accent-red)] animate-pulse">{error}</p>}
                    </div>

                    <div className="mt-2 flex gap-3">
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
                            className="flex flex-[2] items-center justify-center rounded-xl bg-[var(--accent-blue)] py-3.5 font-[800] text-[var(--bg-primary)] transition-all hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Subtask'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
