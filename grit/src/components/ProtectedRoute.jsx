import { useAuth } from '../context/AuthContext'
import AuthLoadingScreen from './AuthLoadingScreen'
import AuthScreen from '../pages/AuthScreen'

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth()

    if (loading) {
        return <AuthLoadingScreen />
    }

    if (!currentUser) {
        return <AuthScreen />
    }

    return children
}
