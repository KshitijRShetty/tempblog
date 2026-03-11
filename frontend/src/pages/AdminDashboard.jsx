import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, MessageSquare, FileText, Loader2 } from 'lucide-react'
import api from '../api/axios'
import ConfirmModal from '../components/ConfirmModal'

const AdminDashboard = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const postsResponse = await api.get('/posts')
      setPosts(postsResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    try {
      await api.delete(`/admin/post/${postToDelete.id}`)
      setPosts(posts.filter(post => post.id !== postToDelete.id))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    )
  }

  const totalPosts = posts.length
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0)
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield size={40} className="text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-gray-400">Manage your blog platform</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6"
        >
          <FileText size={32} className="text-purple-400 mb-2" />
          <h3 className="text-gray-400 mb-1">Total Posts</h3>
          <p className="text-3xl font-bold text-white">{totalPosts}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-md border border-pink-500/30 rounded-xl p-6"
        >
          <Users size={32} className="text-pink-400 mb-2" />
          <h3 className="text-gray-400 mb-1">Total Likes</h3>
          <p className="text-3xl font-bold text-white">{totalLikes}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6"
        >
          <MessageSquare size={32} className="text-blue-400 mb-2" />
          <h3 className="text-gray-400 mb-1">Total Comments</h3>
          <p className="text-3xl font-bold text-white">{totalComments}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">All Posts</h2>
        
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-4 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400">
                  By {post.user?.name || 'Anonymous'} • {post.likes || 0} likes • {post.comments?.length || 0} comments
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setPostToDelete(post)
                  setShowDeleteModal(true)
                }}
                className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 hover:bg-red-500/30 transition"
              >
                Delete
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setPostToDelete(null)
        }}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message={`Are you sure you want to permanently delete "${postToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default AdminDashboard
