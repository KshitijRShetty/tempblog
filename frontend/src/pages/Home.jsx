import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PostCard from '../components/PostCard'
import PostCardSkeleton from '../components/PostCardSkeleton'
import NotificationModal from '../components/NotificationModal'
import api from '../api/axios'
import { Loader2, Search, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useBookmarks from '../hooks/useBookmarks'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([]) // Store all posts for filtering
  const [trendingPosts, setTrendingPosts] = useState([])
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { isAuthenticated } = useAuth()
  const { toggleBookmark, isBookmarked } = useBookmarks()
  
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
  
  // Fixed grid size for stable layout
  const SKELETON_COUNT = 9

  useEffect(() => {
    fetchPosts()
    fetchTrendingPosts()
    
    // Auto-refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      fetchPosts(true) // Pass true for silent refresh
      fetchTrendingPosts(true)
    }, 300000)
    
    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    if (isAuthenticated && posts.length > 0) {
      checkLikedPosts()
    }
  }, [isAuthenticated, posts.length])

  const fetchPosts = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      
      const response = await api.get('/posts/feed')
      setPosts(response.data)
      setAllPosts(response.data) // Store all posts for filtering
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchTrendingPosts = async (silent = false) => {
    try {
      if (!silent) setLoadingTrending(true)
      
      const response = await api.get('/posts/trending')
      setTrendingPosts(response.data)
    } catch (error) {
      console.error('Error fetching trending posts:', error)
    } finally {
      setLoadingTrending(false)
    }
  }

  const handleRefresh = () => {
    setSearchKeyword('') // Clear search on refresh
    setHasSearched(false)
    fetchPosts()
    fetchTrendingPosts()
    if (isAuthenticated && posts.length > 0) {
      checkLikedPosts()
    }
  }

  const checkLikedPosts = async () => {
    try {
      const likedSet = new Set()
      for (const post of posts) {
        // Skip external posts
        if (post.external) continue
        
        try {
          const response = await api.get(`/posts/${post.id}/liked`)
          if (response.data.liked) {
            likedSet.add(post.id)
          }
        } catch (error) {
          // User not authenticated or error checking like status
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
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Failed to like post. Please login.')
    }
  }

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(post => post.id !== postId))
      setAllPosts(allPosts.filter(post => post.id !== postId))
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

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchKeyword.trim()) {
      // If search is empty, show all posts
      setPosts(allPosts)
      setHasSearched(false)
      return
    }
    
    setSearching(true)
    setHasSearched(true)
    
    try {
      // Filter through all posts (local + external) client-side
      const keyword = searchKeyword.toLowerCase()
      const filteredPosts = allPosts.filter(post => {
        const title = (post.title || '').toLowerCase()
        const content = (post.content || '').toLowerCase()
        const author = (post.user?.name || '').toLowerCase()
        
        return title.includes(keyword) || 
               content.includes(keyword) || 
               author.includes(keyword)
      })
      
      setPosts(filteredPosts)
      
      // Check liked posts for search results
      if (isAuthenticated && filteredPosts.length > 0) {
        const likedSet = new Set()
        for (const post of filteredPosts) {
          // Skip external posts
          if (post.external) continue
          
          try {
            const likedResponse = await api.get(`/posts/${post.id}/liked`)
            if (likedResponse.data.liked) {
              likedSet.add(post.id)
            }
          } catch (error) {
            console.log('Error checking like status:', error)
          }
        }
        setLikedPosts(likedSet)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchKeyword(value)
    
    // Automatically show all posts when search is cleared
    if (!value.trim() && hasSearched) {
      setPosts(allPosts)
      setHasSearched(false)
    }
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setHasSearched(false)
    setPosts(allPosts) // Restore all posts from cache
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text mb-4">
            Welcome to FutureBlog
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Share your thoughts with the world
          </p>
        </motion.div>

        {/* Loading Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(SKELETON_COUNT)].map((_, index) => (
            <PostCardSkeleton key={index} index={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text mb-4">
          Welcome to FutureBlog
        </h1>
        <p className="text-xl text-gray-300 mb-4">
          Share your thoughts with the world
        </p>
        
        {/* Refresh Button and Last Updated */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </motion.button>
          {lastUpdated && (
            <span className="text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSearch}
        className="max-w-3xl mx-auto mb-12"
      >
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={handleSearchChange}
            placeholder="Search by title, content, or author..."
            className="w-full px-6 py-4 pr-32 bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-2">
            {searchKeyword && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition"
              >
                Clear
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {searching ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
              <span>Search</span>
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Trending Blogs Section */}
      {!loadingTrending && trendingPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔥</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 text-transparent bg-clip-text">
              Trending Now
            </h2>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
              <div className="flex gap-6 min-w-max">
                {trendingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-96 flex-shrink-0"
                  >
                    <div className="relative h-full">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                      
                      {/* Card */}
                      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md border-2 border-orange-500/30 rounded-2xl p-6 h-full hover:border-orange-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                        {/* Trending Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                            #{index + 1} TRENDING
                          </span>
                          {post.trendingScore && (
                            <span className="text-xs text-gray-400">
                              Score: {post.trendingScore.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Image */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <img
                            src={post.imageUrls[0]}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Content Preview */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {post.content}
                        </p>

                        {/* Author & Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {post.user?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="text-gray-300">{post.user?.name || 'Anonymous'}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1">
                              ❤️ {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              💬 {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* External Link or View Button */}
                        {post.external ? (
                          <button
                            onClick={() => handleExternalClick(post.url)}
                            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
                          >
                            Read on {post.sourceLabel || 'External Site'}
                          </button>
                        ) : (
                          <button
                            onClick={() => window.location.href = `/post/${post.id}`}
                            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
                          >
                            Read Full Post
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none"></div>
          </div>
        </motion.div>
      )}

      {posts.length === 0 && !loading && hasSearched ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            No posts found matching your search.
          </p>
        </div>
      ) : posts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            No posts yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <>
          {hasSearched && searchKeyword && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center"
            >
              <p className="text-gray-300">
                Found <span className="text-purple-400 font-semibold">{posts.length}</span> post{posts.length !== 1 ? 's' : ''} for "{searchKeyword}"
              </p>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Always render SKELETON_COUNT slots */}
            {[...Array(SKELETON_COUNT)].map((_, index) => {
              const post = posts[index]
              
              if (post) {
                // Render actual post card
                return (
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
                      showActions={true}
                      isLiked={likedPosts.has(post.id)}
                      isBookmarked={isBookmarked(post.id)}
                      isExternal={post.external}
                    />
                  </motion.div>
                )
              } else {
                // Render skeleton for empty slots
                return <PostCardSkeleton key={`skeleton-${index}`} index={index} />
              }
            })}
            
            {/* Render additional posts beyond SKELETON_COUNT */}
            {posts.length > SKELETON_COUNT && posts.slice(SKELETON_COUNT).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (SKELETON_COUNT + index) * 0.1 }}
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
                  isExternal={post.external}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

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

export default Home
