import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, ArrowLeft, Calendar, Clock, User, Tag, Bookmark } from 'lucide-react'
import { useState, useEffect } from 'react'
import useBookmarks from '../hooks/useBookmarks'

const BlogPreview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [post, setPost] = useState(location.state?.post || null)
  const { toggleBookmark, isBookmarked } = useBookmarks()

  useEffect(() => {
    // If no post data in state, redirect back to home
    if (!post) {
      navigate('/')
    }
  }, [post, navigate])

  if (!post) {
    return null
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`
    }
    return url
  }

  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200
    const words = content?.split(/\s+/).length || 0
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes < 1 ? 1 : minutes
  }
  
  // Use provided reading time or estimate from content
  const readingTime = post.readingTime || estimateReadingTime(post.content)

  const getSourceBadge = (source, sourceLabel) => {
    const badges = {
      'devto': { color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300', icon: '🌐', name: 'Dev.to' },
      'hackernews': { color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-300', icon: '📰', name: 'Hacker News' },
      'rss': { color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-300', icon: '📡', name: sourceLabel || 'RSS Feed' },
    }
    return badges[source] || badges['rss']
  }

  const sourceBadge = getSourceBadge(post.source, post.sourceLabel)

  const handleReadFullArticle = () => {
    window.open(post.url, '_blank', 'noopener,noreferrer')
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Extract tags if available (assuming tags might be in post.tags array or similar)
  const tags = post.tags || []

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Feed</span>
        </motion.button>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Cover Image */}
          <div className="w-full h-80 bg-gradient-to-br from-purple-900/30 to-pink-900/30 relative overflow-hidden">
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <img 
                src={getImageUrl(post.imageUrls[0])} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-9xl font-bold text-white/90">
                  {post.title?.charAt(0).toUpperCase() || 'B'}
                </div>
              </div>
            )}

            {/* Source Badge Overlay */}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-2 bg-gradient-to-r ${sourceBadge.color} backdrop-blur-md border ${sourceBadge.border} rounded-lg text-sm ${sourceBadge.text} flex items-center gap-2 font-semibold shadow-lg`}>
                <span>{sourceBadge.icon}</span>
                <span>{sourceBadge.name}</span>
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-white mb-4 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Meta Information */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 text-gray-300 mb-6 pb-6 border-b border-purple-500/20"
            >
              {/* Author */}
              <div className="flex items-center gap-2">
                <User size={18} className="text-purple-400" />
                <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                <span>{formatDate(post.createdAt)}</span>
              </div>

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                <span>{readingTime} min read</span>
              </div>
            </motion.div>

            {/* Description/Content Preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-purple-300 mb-3">About This Article</h3>
              <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                {post.content ? (
                  post.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>No description available. Click the button below to read the full article.</p>
                )}
              </div>
            </motion.div>

            {/* Tags */}
            {tags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-300">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-purple-500/20"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleBookmark(post)}
                className={`px-6 py-3 rounded-xl font-semibold text-base flex items-center gap-2 transition ${
                  isBookmarked(post.id)
                    ? 'bg-yellow-500/90 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-black/40 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                }`}
              >
                <Bookmark size={20} fill={isBookmarked(post.id) ? 'currentColor' : 'none'} />
                <span>{isBookmarked(post.id) ? 'Bookmarked' : 'Bookmark'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReadFullArticle}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition flex items-center gap-3"
              >
                <span>Read Full Article on {sourceBadge.name}</span>
                <ExternalLink size={24} />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BlogPreview
