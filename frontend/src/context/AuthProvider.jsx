import { useState } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    )

    const login = (userData, token) => {
        if (token) {
            localStorage.setItem('token', token)
        }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    // Nouvelle fonction
    const updateUser = (userData) => {
        const updated = { ...user, ...userData }
        localStorage.setItem('user', JSON.stringify(updated))
        setUser(updated)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}