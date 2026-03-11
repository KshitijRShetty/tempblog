import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-white" size={28} />
      case 'error':
        return <AlertCircle className="text-white" size={28} />
      case 'info':
        return <Info className="text-white" size={28} />
      default:
        return <CheckCircle2 className="text-white" size={28} />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
          border: 'border-green-500/40',
          shadow: 'shadow-green-500/50',
          accentGradient: 'from-green-500 to-emerald-500',
          buttonGradient: 'from-green-600 via-green-600 to-green-700 hover:from-green-500 hover:to-green-600',
          buttonShadow: 'shadow-green-500/50 hover:shadow-green-500/60',
          glowFrom: 'from-green-500/10',
          glowTo: 'to-emerald-500/10'
        }
      case 'error':
        return {
          iconBg: 'bg-gradient-to-br from-red-500 to-red-700',
          border: 'border-red-500/40',
          shadow: 'shadow-red-500/50',
          accentGradient: 'from-red-500 to-pink-500',
          buttonGradient: 'from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
          buttonShadow: 'shadow-red-500/50 hover:shadow-red-500/60',
          glowFrom: 'from-red-500/10',
          glowTo: 'to-pink-500/10'
        }
      case 'info':
        return {
          iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
          border: 'border-blue-500/40',
          shadow: 'shadow-blue-500/50',
          accentGradient: 'from-blue-500 to-purple-500',
          buttonGradient: 'from-blue-600 via-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
          buttonShadow: 'shadow-blue-500/50 hover:shadow-blue-500/60',
          glowFrom: 'from-blue-500/10',
          glowTo: 'to-purple-500/10'
        }
      default:
        return {
          iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
          border: 'border-green-500/40',
          shadow: 'shadow-green-500/50',
          accentGradient: 'from-green-500 to-emerald-500',
          buttonGradient: 'from-green-600 via-green-600 to-green-700 hover:from-green-500 hover:to-green-600',
          buttonShadow: 'shadow-green-500/50 hover:shadow-green-500/60',
          glowFrom: 'from-green-500/10',
          glowTo: 'to-emerald-500/10'
        }
    }
  }

  const colors = getColors()

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Floating Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 400,
                duration: 0.3
              }}
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-2xl border ${colors.border} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
              style={{
                boxShadow: `0 0 60px rgba(${type === 'success' ? '34, 197, 94' : type === 'error' ? '239, 68, 68' : '59, 130, 246'}, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5)`
              }}
            >
              {/* Animated glow effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.glowFrom} ${colors.glowTo} blur-xl -z-10`} />
              
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </motion.button>

              {/* Header with icon */}
              <div className="flex items-start space-x-4 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`${colors.iconBg} p-4 rounded-2xl shadow-lg ${colors.shadow}`}
                >
                  {getIcon()}
                </motion.div>
                <div className="flex-1 pt-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Information')}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`h-1 w-12 bg-gradient-to-r ${colors.accentGradient} rounded-full`}
                  />
                </div>
              </div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-gray-300 mb-8 leading-relaxed text-base"
              >
                {message || 'Operation completed successfully.'}
              </motion.p>

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`w-full px-6 py-3.5 bg-gradient-to-br ${colors.buttonGradient} rounded-xl text-white font-semibold transition-all shadow-lg ${colors.buttonShadow} border border-${type}-500/50`}
                >
                  {type === 'success' ? 'Continue' : 'Close'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}

export default NotificationModal
