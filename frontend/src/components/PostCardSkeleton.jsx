import { motion } from 'framer-motion'

const PostCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-black/40 backdrop-blur-md border border-gray-600/30 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-xl animate-pulse-skeleton"
    >
      {/* Image Skeleton - Fixed height matching PostCard */}
      <div className="w-full h-48 flex-shrink-0 bg-gradient-to-br from-gray-700/40 to-gray-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
        
        {/* Decorative circles like PostCard's fallback */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gray-500/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content Skeleton - Matches PostCard padding and structure */}
      <div className="p-6 flex flex-col flex-1 min-h-0">
        {/* Source Badge Skeleton */}
        <div className="mb-2">
          <div className="h-6 bg-gray-600/30 rounded-md w-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Title Skeleton - Matches h-14 line-clamp-2 */}
        <div className="mb-2 h-14 space-y-2">
          <div className="h-6 bg-gray-500/40 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-6 bg-gray-500/40 rounded-md w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Content Skeleton - Matches line-clamp-3 flex-1 */}
        <div className="mb-4 space-y-2 flex-1 overflow-hidden">
          <div className="h-4 bg-gray-600/25 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/25 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gray-600/25 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/25 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gray-600/25 rounded-md w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/25 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Meta Skeleton - Author and Date */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="h-4 bg-gray-600/30 rounded-md w-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gray-600/30 rounded-md w-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Actions Skeleton - Matches button layout */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            {/* Like button skeleton */}
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-600/30 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
              </div>
              <div className="h-4 w-8 bg-gray-600/30 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Comment button skeleton */}
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-600/30 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
              </div>
              <div className="h-4 w-8 bg-gray-600/30 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PostCardSkeleton
