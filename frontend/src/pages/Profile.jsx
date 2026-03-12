import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, FileText, Heart, MessageCircle, Mail, Calendar, Loader2, Camera, Edit2, Save, X, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import NotificationModal from '../components/NotificationModal'
import api from '../api/axios'
import useBookmarks from '../hooks/useBookmarks'

const Profile = () => {
  const { user, setUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editBio, setEditBio] = useState(user?.bio || '')
  const [editInterests, setEditInterests] = useState(user?.interests || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Notification modal state
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  })

  const showNotification = (title, message, type = 'success') => {
    setNotification({ isOpen: true, title, message, type })
  }

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false })
  }

  useEffect(() => {
    fetchUserProfile()
    fetchUserPosts()
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      checkLikedPosts()
    }
  }, [posts.length])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setUser(response.data)
      setEditName(response.data.name || '')
      setEditBio(response.data.bio || '')
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

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
      showNotification('Success!', 'Post deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting post:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete post'
      showNotification('Delete Failed', errorMessage, 'error')
    }
  }

  const handleExternalClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Invalid File', 'Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File Too Large', 'Image size should be less than 5MB', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update user state and localStorage
      const updatedUser = response.data
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      showNotification('Success!', 'Profile photo updated successfully', 'success')
    } catch (error) {
      console.error('Error uploading photo:', error)
      showNotification('Upload Failed', error.response?.data?.message || error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/users/profile', {
        name: editName,
        bio: editBio,
        interests: editInterests
      })

      // Update user state and localStorage
      const updatedUser = response.data
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
      showNotification('Profile Updated!', 'Your profile has been updated successfully', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('Update Failed', error.response?.data?.message || error.message, 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditName(user?.name || '')
    setEditBio(user?.bio || '')
    setEditInterests(user?.interests || '')
    setIsEditing(false)
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
          {/* Profile Photo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative group"
          >
            {user?.profileImage ? (
              <img 
                src={`http://localhost:8080${user.profileImage}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-4 border-purple-500">
                <User size={64} className="text-white" />
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 rounded-full p-2 border-2 border-white shadow-lg transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </motion.button>
          </motion.div>
          
          <div className="flex-1">
            {/* Edit Profile Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-bold bg-black/40 text-white border border-purple-500/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500"
                    placeholder="Your name"
                  />
                ) : (
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white"
                  >
                    {user?.name || 'User'}
                  </motion.h1>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                    >
                      <Save size={18} />
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition"
                    >
                      <X size={18} />
                      Cancel
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 text-gray-300"
            >
              <div className="flex items-center space-x-2">
                <Mail size={18} className="text-purple-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-purple-400" />
                <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              
              {/* Bio Section */}
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-black/40 text-white border border-purple-500/50 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                ) : (
                  user?.bio && (
                    <div className="bg-black/30 rounded-lg p-4 mt-2">
                      <p className="text-gray-200 whitespace-pre-wrap">{user.bio}</p>
                    </div>
                  )
                )}
              </div>

              {/* Interests Section */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={18} className="text-purple-400" />
                  <span className="text-gray-300 font-medium">Interests</span>
                </div>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editInterests}
                      onChange={(e) => setEditInterests(e.target.value)}
                      className="w-full bg-black/40 text-white border border-purple-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Technology, Travel, Photography, Gaming"
                    />
                    <p className="text-xs text-gray-400 mt-1">Separate interests with commas</p>
                  </div>
                ) : (
                  user?.interests ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.interests.split(',').map((interest, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No interests added yet</p>
                  )
                )}
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
                  onBookmark={toggleBookmark}
                  showActions={true}
                  isLiked={likedPosts.has(post.id)}
                  isBookmarked={isBookmarked(post.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

export default Profile
