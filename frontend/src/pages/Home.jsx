import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PostCard from '../components/PostCard'
import api from '../api/axios'
import { Loader2 } from 'lucide-react'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts')
      setPosts(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      setPosts(posts.map(post => 
        post.id === postId ? response.data : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Failed to like post. Please login.')
    }
  }

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(post => post.id !== postId))
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text mb-4">
          Welcome to FutureBlog
        </h1>
        <p className="text-xl text-gray-300">
          Share your thoughts with the world
        </p>
      </motion.div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            No posts yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <PostCard 
                post={post} 
                onLike={handleLike}
                onDelete={handleDelete}
                showActions={false}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
