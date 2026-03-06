import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomeScreen from './pages/HomeScreen'

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <HomeScreen />
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
