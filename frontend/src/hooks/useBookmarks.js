import { useState, useEffect } from 'react'

const BOOKMARKS_KEY = 'futureblog_bookmarks'

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY)
      if (saved) {
        setBookmarks(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setBookmarks([])
    }
  }, [])

  // Save bookmarks to localStorage whenever they change
  const saveToStorage = (bookmarksList) => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksList))
    } catch (error) {
      console.error('Error saving bookmarks:', error)
    }
  }

  const addBookmark = (post) => {
    // Check if already bookmarked
    const exists = bookmarks.some(b => b.id === post.id)
    if (exists) return false

    const newBookmarks = [...bookmarks, { ...post, bookmarkedAt: new Date().toISOString() }]
    setBookmarks(newBookmarks)
    saveToStorage(newBookmarks)
    return true
  }

  const removeBookmark = (postId) => {
    const newBookmarks = bookmarks.filter(b => b.id !== postId)
    setBookmarks(newBookmarks)
    saveToStorage(newBookmarks)
    return true
  }

  const toggleBookmark = (post) => {
    const isBookmarked = bookmarks.some(b => b.id === post.id)
    if (isBookmarked) {
      return removeBookmark(post.id)
    } else {
      return addBookmark(post)
    }
  }

  const isBookmarked = (postId) => {
    return bookmarks.some(b => b.id === postId)
  }

  const clearAllBookmarks = () => {
    setBookmarks([])
    saveToStorage([])
  }

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
  }
}

export default useBookmarks
