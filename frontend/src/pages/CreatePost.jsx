import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PenLine, Image as ImageIcon, Upload, X } from 'lucide-react'
import api from '../api/axios'

const CreatePost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleFileSelect(file)
      } else {
        alert('Please drop an image file')
      }
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setImageFile(file)
    setImageUrl('') // Clear URL input when file is selected

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data // Returns the image path
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = imageUrl

      // Upload image file if selected
      if (imageFile) {
        const uploadedPath = await uploadImage()
        if (uploadedPath) {
          finalImageUrl = uploadedPath
        }
      }

      await api.post('/posts/create', {
        title,
        content,
        imageUrl: finalImageUrl || null
      })
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8"
      >
        <div className="flex items-center space-x-3 mb-8">
          <PenLine size={32} className="text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Create New Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter your post title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Write your post content..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <ImageIcon size={20} />
                <span>Image (optional)</span>
              </div>
            </label>

            {/* Drag and Drop Zone */}
            {!imagePreview && !imageUrl && (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <motion.div
                    animate={{ y: isDragging ? -5 : 0 }}
                    className="flex flex-col items-center space-y-3"
                  >
                    <Upload size={48} className="text-purple-400" />
                    <div className="text-gray-300">
                      <p className="font-semibold">
                        {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </motion.div>
                </label>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative border border-purple-500/30 rounded-lg overflow-hidden bg-black/20">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            )})

            {/* URL Input as Alternative */}
            {!imageFile && (
              <div className="mt-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="flex-1 border-t border-purple-500/30"></div>
                  <span className="px-4 text-gray-400 text-sm">or use URL</span>
                  <div className="flex-1 border-t border-purple-500/30"></div>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="relative border border-purple-500/30 rounded-lg overflow-hidden mt-4 bg-black/20">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Post'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gray-600 rounded-lg text-white font-semibold hover:bg-gray-700 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CreatePost
