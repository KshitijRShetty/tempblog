import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowLeft, Loader2, Share2 } from 'lucide-react'
import api from '../api/axios'
import CommentSection from '../components/CommentSection'
import ImageCarousel from '../components/ImageCarousel'
import PostDetailSkeleton from '../components/PostDetailSkeleton'
import { useAuth } from '../context/AuthContext'

const PostDetail = () => {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [shareFeedback, setShareFeedback] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && post) {
      checkLikedStatus()
    }
  }, [isAuthenticated, post?.id])

  const getImageUrl = (url) => {
    if (!url) return null
    // If it's a relative path (starts with /uploads/), prepend the backend URL
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`
    }
    // Otherwise, return the URL as-is (for external URLs)
    return url
  }

  const fetchPost = async () => {
    try {
      const response = await api.get('/posts')
      const foundPost = response.data.find(p => p.id === parseInt(id))
      setPost(foundPost)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${id}/comments`)
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const checkLikedStatus = async () => {
    try {
      const response = await api.get(`/posts/${id}/liked`)
      setIsLiked(response.data.liked)
    } catch (error) {
      console.log('Error checking like status:', error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${id}/like`)
      const updatedLikes = response.data.post?.likes
      setPost((prevPost) => (
        prevPost
          ? { ...prevPost, likes: updatedLikes ?? prevPost.likes }
          : response.data.post
      ))
      setIsLiked(response.data.liked)
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Failed to like post. Please login.')
    }
  }

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment])
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    const shareData = {
      title: post.title || 'FutureBlog Post',
      text: `Check out this post: ${post.title || 'FutureBlog Post'}`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setShareFeedback('Copied')
    } catch (error) {
      if (!navigator.share) {
        setShareFeedback('Failed')
      }
    } finally {
      if (!navigator.share) {
        setTimeout(() => setShareFeedback(''), 1800)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <PostDetailSkeleton />
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-400">Post not found</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Go back home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </motion.button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl overflow-hidden"
      >
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="w-full h-[600px]">
            <ImageCarousel images={post.imageUrls} alt={post.title} />
          </div>
        )}

        <div className="p-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-gray-400 mb-6 pb-6 border-b border-purple-500/30">
            <div>
              <span 
                onClick={() => post.user?.email && navigate(`/users/${post.user.email}`)}
                className={`text-purple-400 font-semibold ${post.user?.email ? 'cursor-pointer hover:text-purple-300 transition-colors' : ''}`}
              >
                {post.user?.name || 'Anonymous'}
              </span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          <div className="text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
            {post.content}
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r rounded-lg text-white font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isLiked
                  ? 'from-pink-600 to-purple-700 hover:shadow-pink-600/50'
                  : 'from-pink-500 to-purple-600 hover:shadow-pink-500/50'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{post.likes || 0} {isLiked ? 'Liked' : 'Likes'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition"
            >
              <Share2 size={20} />
              <span>{shareFeedback || 'Share'}</span>
            </motion.button>
          </div>

          <div className="mt-8">
            <CommentSection 
              postId={post.id} 
              comments={comments}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>
      </motion.article>
    </div>
  )
}

export default PostDetail
