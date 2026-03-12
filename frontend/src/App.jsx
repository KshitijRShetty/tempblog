import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import AdminDashboard from './pages/AdminDashboard'
import BlogPreview from './pages/BlogPreview'
import Bookmarks from './pages/Bookmarks'

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/preview/:id" element={<BlogPreview />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/users/:email" element={<PublicProfile />} />
          <Route 
            path="/create" 
            element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/edit/:id" 
            element={isAuthenticated ? <EditPost /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated && user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
