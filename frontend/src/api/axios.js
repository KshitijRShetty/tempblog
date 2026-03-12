import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to expired JWT
    if (error.response?.status === 401 || 
        error.response?.data?.includes?.('JWT expired') ||
        error.message?.includes?.('JWT expired')) {
      // Clear expired token and user data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login
      window.location.href = '/login'
      
      // Show friendly message
      alert('Your session has expired. Please log in again.')
    }
    
    return Promise.reject(error)
  }
)

export default api
