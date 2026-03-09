import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, FileText, Heart, MessageCircle, Mail, Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import api from '../api/axios'

const Profile = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  })

  useEffect(() => {
    fetchUserPosts()
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      checkLikedPosts()
    }
  }, [posts.length])

  const fetchUserPosts = async () => {
    try {
      const response = await api.get('/posts')
      // Filter posts by current user's email
      const userPosts = response.data.filter(post => post.user?.email === user?.email)
      setPosts(userPosts)
      
      // Calculate stats
      const totalPosts = userPosts.length
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
      
      setStats({ totalPosts, totalLikes, totalComments })
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkLikedPosts = async () => {
    try {
      const likedSet = new Set()
      for (const post of posts) {
        try {
          const response = await api.get(`/posts/${post.id}/liked`)
          if (response.data.liked) {
            likedSet.add(post.id)
          }
        } catch (error) {
          console.log('Error checking like status:', error)
        }
      }
      setLikedPosts(likedSet)
    } catch (error) {
      console.error('Error checking liked posts:', error)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      // Update the specific post
      setPosts(posts.map(post => 
        post.id === postId ? response.data.post : post
      ))
      
      // Update liked status
      const newLikedPosts = new Set(likedPosts)
      if (response.data.liked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      setLikedPosts(newLikedPosts)
      
      // Recalculate stats
      const updatedPosts = posts.map(post => 
        post.id === postId ? response.data.post : post
      )
      const totalLikes = updatedPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
      setStats(prev => ({ ...prev, totalLikes }))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(post => post.id !== postId))
      // Recalculate stats
      const remainingPosts = posts.filter(post => post.id !== postId)
      const totalPosts = remainingPosts.length
      const totalLikes = remainingPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
      const totalComments = remainingPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
      setStats({ totalPosts, totalLikes, totalComments })
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const handleExternalClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-start space-x-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-6"
          >
            <User size={48} className="text-white" />
          </motion.div>
          
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {user?.name || 'User'}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 text-gray-300"
            >
              <div className="flex items-center space-x-2">
                <Mail size={18} className="text-purple-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-purple-400" />
                <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 text-center"
          >
            <FileText size={32} className="text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
            <p className="text-gray-400 text-sm">Posts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-black/40 backdrop-blur-md border border-pink-500/30 rounded-lg p-4 text-center"
          >
            <Heart size={32} className="text-pink-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{stats.totalLikes}</p>
            <p className="text-gray-400 text-sm">Likes Received</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-black/40 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 text-center"
          >
            <MessageCircle size={32} className="text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{stats.totalComments}</p>
            <p className="text-gray-400 text-sm">Comments Received</p>
          </motion.div>
        </div>
      </motion.div>

      {/* User's Posts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-white mb-6">My Posts</h2>
        
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-12 text-center"
          >
            <FileText size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No posts yet</h3>
            <p className="text-gray-500">Start sharing your thoughts by creating your first post!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PostCard 
                  post={post} 
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onExternalClick={handleExternalClick}
                  showActions={true}
                  isLiked={likedPosts.has(post.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Profile
