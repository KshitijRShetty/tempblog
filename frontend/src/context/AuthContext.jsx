import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const token = response.data
      
      // Decode token to get user info (simple JWT decode)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userData = {
        email: payload.sub,
        name: payload.name || email.split('@')[0], // Extract name from token or use email prefix
        role: payload.role || 'USER',
        createdAt: payload.createdAt || new Date().toISOString()
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(token)
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
