import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmModal from './ConfirmModal'

const PostCard = ({ post, onLike, onDelete, showActions = false }) => {
  const { isAuthenticated, user } = useAuth()
  const isOwner = user?.email === post.user?.email
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getImageUrl = (url) => {
    if (!url) return null
    // If it's a relative path (starts with /uploads/), prepend the backend URL
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`
    }
    // Otherwise, return the URL as-is (for external URLs)
    return url
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 transition-all flex flex-col h-full"
    >
      {post.imageUrl && (
        <div className="w-full h-48 bg-black/20 flex items-center justify-center overflow-hidden">
          <img 
            src={getImageUrl(post.imageUrl)} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <Link to={`/post/${post.id}`}>
          <h2 className="text-2xl font-bold text-white mb-2 hover:text-purple-400 transition cursor-pointer">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-300 mb-4 line-clamp-3">
          {post.content}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>By {post.user?.name || 'Anonymous'}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(post.id)}
              disabled={!isAuthenticated}
              className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart size={20} />
              <span>{post.likes || 0}</span>
            </motion.button>

            <Link to={`/post/${post.id}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
              >
                <MessageCircle size={20} />
                <span>{post.comments?.length || 0}</span>
              </motion.button>
            </Link>
          </div>

          {showActions && isOwner && (
            <div className="flex space-x-2">
              <Link to={`/edit/${post.id}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition"
                >
                  <Edit size={18} />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(post.id)}
        title="Delete Post"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
      />
    </motion.div>
  )
}

export default PostCard
