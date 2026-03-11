import { motion } from 'framer-motion'

const PostCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-xl"
    >
      {/* Image Skeleton */}
      <div className="w-full h-48 flex-shrink-0 bg-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-1 min-h-0">
        {/* Title Skeleton */}
        <div className="mb-4 space-y-3">
          <div className="h-6 bg-white/10 rounded-md w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-6 bg-white/10 rounded-md w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="mb-4 space-y-2 flex-1">
          <div className="h-4 bg-white/8 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-white/8 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-white/8 rounded-md w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-white/8 rounded-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-white/8 rounded-md w-4/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Meta Skeleton */}
        <div className="flex items-center justify-between text-sm mb-4 mt-auto">
          <div className="h-4 bg-white/10 rounded-md w-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-white/10 rounded-md w-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
          <div className="h-9 bg-white/10 rounded-lg w-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-9 bg-white/10 rounded-lg w-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PostCardSkeleton
