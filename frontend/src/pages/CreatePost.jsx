import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PenLine, Image as ImageIcon, Upload, X } from 'lucide-react'
import api from '../api/axios'

const CreatePost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
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

    const files = Array.from(e.dataTransfer.files)
    const imageFilesList = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFilesList.length > 0) {
      handleFilesSelect(imageFilesList)
    } else {
      alert('Please drop image files')
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFilesSelect(files)
    }
  }

  const handleFilesSelect = (files) => {
    // Limit to 10 images (Instagram allows up to 10)
    const maxImages = 10
    const remainingSlots = maxImages - imageFiles.length
    
    if (files.length > remainingSlots) {
      alert(`You can only upload up to ${maxImages} images. ${remainingSlots} slots remaining.`)
      files = files.slice(0, remainingSlots)
    }

    // Validate file sizes (5MB max each)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. File size must be less than 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Add new files to existing
    setImageFiles(prev => [...prev, ...validFiles])

    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (imageFiles.length === 0) return []

    setUploading(true)
    try {
      const formData = new FormData()
      imageFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data // Returns array of image paths
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
      return []
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrls = []

      // Upload image files if selected
      if (imageFiles.length > 0) {
        const uploadedPaths = await uploadImages()
        if (uploadedPaths.length > 0) {
          imageUrls = uploadedPaths
        }
      }

      await api.post('/posts/create', {
        title,
        content,
        imageUrls: imageUrls
      })
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      console.error('Error details:', error.response?.data)
      alert('Failed to create post: ' + (error.response?.data?.message || error.message))
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
                <span>Images (optional - up to 10)</span>
              </div>
            </label>

            {/* Drag and Drop Zone */}
            {imagePreviews.length === 0 && (
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
                  multiple
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
                        {isDragging ? 'Drop your images here' : 'Drag & drop your images here'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">or click to browse (up to 10 images)</p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                  </motion.div>
                </label>
              </div>
            )}

            {/* Image Previews Grid */}
            {imagePreviews.length > 0 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative border border-purple-500/30 rounded-lg overflow-hidden bg-black/20 aspect-square"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition"
                      >
                        <X size={16} className="text-white" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Add More Button */}
                {imagePreviews.length < 10 && (
                  <label htmlFor="file-upload-more" className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload-more"
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 rounded-lg text-center text-gray-400 hover:text-purple-400 transition"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ImageIcon size={20} />
                        <span>Add more images ({imagePreviews.length}/10)</span>
                      </div>
                    </motion.div>
                  </label>
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
