import { motion } from 'framer-motion'
import { Bookmark, Trash2 } from 'lucide-react'
import PostCard from '../components/PostCard'
import useBookmarks from '../hooks/useBookmarks'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Bookmarks = () => {
  const { bookmarks, toggleBookmark, clearAllBookmarks, isBookmarked } = useBookmarks()
  const navigate = useNavigate()
  const [likedPosts, setLikedPosts] = useState(new Set())
  const { isAuthenticated } = useAuth()

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      // Update liked status
      const newLikedPosts = new Set(likedPosts)
      if (response.data.liked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      setLikedPosts(newLikedPosts)
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Failed to like post. Please login.')
    }
  }

  const handleDelete = async (postId) => {
    // For bookmarked posts, we can't actually delete them from the server
    // unless the user is the owner. So this is just a placeholder.
    console.log('Delete not available for bookmarked external posts')
  }

  const handleExternalClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all bookmarks?')) {
      clearAllBookmarks()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Bookmark size={40} className="text-yellow-400" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-transparent bg-clip-text">
            My Bookmarks
          </h1>
        </div>
        <p className="text-xl text-gray-300 mb-4">
          Your saved articles in one place
        </p>
        
        {bookmarks.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition"
          >
            <Trash2 size={16} />
            <span>Clear All Bookmarks</span>
          </motion.button>
        )}
      </motion.div>

      {bookmarks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Bookmark size={80} className="text-gray-600 mx-auto mb-4" />
          <p className="text-2xl text-gray-400 mb-2">No bookmarks yet</p>
          <p className="text-gray-500 mb-6">
            Start bookmarking your favorite articles to read them later
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            Browse Articles
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-300">
              You have <span className="text-yellow-400 font-semibold">{bookmarks.length}</span> saved article{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard 
                  post={post} 
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onExternalClick={handleExternalClick}
                  onBookmark={toggleBookmark}
                  showActions={false}
                  isLiked={likedPosts.has(post.id)}
                  isBookmarked={isBookmarked(post.id)}
                  isExternal={post.external}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Bookmarks
