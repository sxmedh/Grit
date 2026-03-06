import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
    const { signIn } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary,#0a0a0a)] px-4">
            <div className="w-full max-w-sm rounded-[12px] border border-[var(--border,#1e1e1e)] bg-[var(--bg-card,#111111)] p-8 text-center shadow-lg">
                <h1 className="mb-2 font-display text-4xl font-[800] tracking-tighter text-[var(--text-primary,#e8e8e8)]">
                    Grit
                </h1>
                <p className="mb-8 text-[var(--text-secondary,#888888)]">Daily habit & task tracker</p>
                <button
                    onClick={signIn}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-[var(--accent-green,#00ff88)] px-4 py-3 font-semibold text-[var(--bg-primary,#0a0a0a)] transition-all hover:bg-opacity-90 active:scale-95"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}
