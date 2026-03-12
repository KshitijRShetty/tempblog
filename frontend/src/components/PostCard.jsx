import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Edit, Trash2, ExternalLink, Bookmark } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmModal from './ConfirmModal'
import ImageCarousel from './ImageCarousel'

const PostCard = ({ post, onLike, onDelete, onExternalClick, showActions = false, isLiked = false, onBookmark, isBookmarked = false }) => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.email === post.user?.email
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isExternal = post.external === true

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

  // Generate a unique gradient based on post title
  const getGradientColors = (title) => {
    const colors = [
      ['from-purple-600', 'via-pink-600', 'to-purple-800'],
      ['from-blue-600', 'via-purple-600', 'to-pink-600'],
      ['from-pink-600', 'via-rose-600', 'to-orange-600'],
      ['from-indigo-600', 'via-blue-600', 'to-cyan-600'],
      ['from-violet-600', 'via-fuchsia-600', 'to-pink-600'],
      ['from-teal-600', 'via-cyan-600', 'to-blue-600'],
    ]
    const index = (title?.charCodeAt(0) || 0) % colors.length
    return colors[index].join(' ')
  }

  // Get first letter of title
  const getInitial = (title) => {
    return title?.charAt(0).toUpperCase() || 'P'
  }

  // Get source badge styling
  const getSourceBadge = (source, sourceLabel) => {
    const badges = {
      'devto': { color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300', icon: '🌐' },
      'hackernews': { color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-300', icon: '📰' },
      'rss': { color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-300', icon: '📡' },
      'local': { color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-300', icon: '✍️' }
    }
    return badges[source] || badges['rss']
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 transition-all flex flex-col h-[500px]"
    >
      {/* Fixed Image Area - Always present */}
      <div className="w-full h-48 flex-shrink-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 relative overflow-hidden">
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <ImageCarousel images={post.imageUrls} alt={post.title} />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientColors(post.title)} relative`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-8xl font-bold text-white/90 mb-2">
                {getInitial(post.title)}
              </div>
              <div className="w-16 h-1 bg-white/50 mx-auto rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Bookmark Button Overlay */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onBookmark && onBookmark(post)
          }}
          className={`absolute top-3 right-3 z-20 p-2 backdrop-blur-md rounded-lg transition-all ${
            isBookmarked 
              ? 'bg-yellow-500/90 text-white shadow-lg shadow-yellow-500/50' 
              : 'bg-black/50 text-gray-300 hover:bg-black/70'
          }`}
          title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
      
      {/* Fixed Content Area */}
      <div className="p-6 flex flex-col flex-1 min-h-0">
        {/* Source Badge */}
        {post.source && (
          <div className="inline-block mb-2">
            <span className={`px-2 py-1 bg-gradient-to-r ${getSourceBadge(post.source).color} border ${getSourceBadge(post.source).border} rounded-md text-xs ${getSourceBadge(post.source).text} flex items-center gap-1 w-fit`}>
              {getSourceBadge(post.source).icon} {post.sourceLabel || post.source}
            </span>
          </div>
        )}
        
        {isExternal ? (
          <div onClick={() => navigate(`/preview/${post.id || post.url}`, { state: { post } })} className="cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white hover:text-purple-400 transition line-clamp-2 h-14 flex-1">
                {post.title || 'Untitled Post'}
              </h2>
              <ExternalLink size={16} className="text-cyan-400 flex-shrink-0" />
            </div>
          </div>
        ) : (
          <Link to={`/post/${post.id}`}>
            <h2 className="text-xl font-bold text-white mb-2 hover:text-purple-400 transition cursor-pointer line-clamp-2 h-14">
              {post.title || 'Untitled Post'}
            </h2>
          </Link>
        )}
        
        <p className="text-gray-300 mb-4 line-clamp-3 flex-1 overflow-hidden">
          {post.content || (isExternal ? 'Click to read this article on Dev.to' : 'No content available')}
        </p>

        {/* Tags Display */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-400">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span 
            onClick={() => post.user?.email && navigate(`/users/${post.user.email}`)}
            className={`truncate mr-2 ${post.user?.email ? 'cursor-pointer hover:text-purple-400 transition-colors' : ''}`}
          >
            By {post.user?.name || 'Anonymous'}
          </span>
          <span className="flex-shrink-0">{formatDate(post.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <motion.button
              whileHover={!isExternal ? { scale: 1.1 } : {}}
              whileTap={!isExternal ? { scale: 0.9 } : {}}
              onClick={() => !isExternal && onLike(post.id)}
              disabled={!isAuthenticated || isExternal}
              className={`flex items-center space-x-2 hover:text-pink-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLiked ? 'text-pink-500' : 'text-pink-400'
              }`}
              title={isExternal ? 'External posts cannot be liked' : ''}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{post.likes || 0}</span>
            </motion.button>

            {isExternal ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/preview/${post.id || post.url}`, { state: { post } })}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
              >
                <ExternalLink size={20} />
                <span>Preview</span>
              </motion.button>
            ) : (
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
            )}
          </div>

          {showActions && isOwner && !isExternal && (
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
