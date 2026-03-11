import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
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
              className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-2xl border border-red-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              style={{
                boxShadow: '0 0 60px rgba(239, 68, 68, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Animated glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/10 to-purple-500/10 blur-xl -z-10" />
              
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
                  className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-2xl shadow-lg shadow-red-500/50"
                >
                  <AlertTriangle className="text-white" size={28} />
                </motion.div>
                <div className="flex-1 pt-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {title || 'Confirm Action'}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="h-1 w-12 bg-gradient-to-r from-red-500 to-purple-500 rounded-full"
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
                {message || 'Are you sure you want to proceed? This action cannot be undone.'}
              </motion.p>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl border border-gray-600/50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-br from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 border border-red-500/50"
                >
                  Delete
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

export default ConfirmModal
