import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    async function signIn() {
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            // Write user document to Firestore on sign-in
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: serverTimestamp()
            }, { merge: true })
        } catch (error) {
            console.error("Error signing in", error)
            throw error
        }
    }

    function signOut() {
        return firebaseSignOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        loading,
        signIn,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
