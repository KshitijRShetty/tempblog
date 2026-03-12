import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const PostDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 mb-6"
      >
        <ArrowLeft size={20} className="text-purple-400/70" />
        <div className="h-5 w-32 bg-purple-300/30 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
        </div>
      </motion.div>

      {/* Post Container Skeleton */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-purple-400/40 rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Image Skeleton */}
        <div className="w-full h-[600px] bg-gradient-to-br from-purple-400/40 to-pink-400/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>

        <div className="p-8">
          {/* Title Skeleton */}
          <div className="mb-4 space-y-3">
            <div className="h-10 bg-purple-300/30 rounded-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>
            <div className="h-10 bg-purple-300/30 rounded-md w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Author & Date Skeleton */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-purple-400/30">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-32 bg-purple-300/30 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
              </div>
              <span className="text-gray-400">•</span>
              <div className="h-5 w-48 bg-purple-300/30 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mb-8 space-y-3">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index}
                className={`h-6 bg-purple-300/25 rounded-md relative overflow-hidden ${
                  index === 7 ? 'w-2/3' : 'w-full'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
              </div>
            ))}
          </div>

          {/* Like Button Skeleton */}
          <div className="h-12 w-32 bg-gradient-to-r from-pink-400/35 to-purple-400/35 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>

          {/* Comments Section Skeleton */}
          <div className="mt-8 space-y-4">
            <div className="h-8 w-48 bg-purple-300/30 rounded-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
            </div>
            
            {/* Comment Input Skeleton */}
            <div className="h-24 bg-purple-300/25 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer"></div>
            </div>

            {/* Sample Comments Skeleton */}
            {[...Array(3)].map((_, index) => (
              <div 
                key={index}
                className="p-4 bg-black/20 border border-purple-400/30 rounded-lg space-y-2"
              >
                <div className="h-4 w-32 bg-purple-300/30 rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-4 w-full bg-purple-300/25 rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-4 w-3/4 bg-purple-300/25 rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  )
}

export default PostDetailSkeleton
