import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const CommentSection = ({ postId, comments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await api.post(`/posts/${postId}/comment`, {
        content: newComment
      })
      setNewComment('')
      onCommentAdded(response.data)
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">
        Comments ({comments?.length || 0})
      </h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={20} />
              <span>Send</span>
            </motion.button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-purple-400">
                  {comment.user?.name || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}

export default CommentSection
