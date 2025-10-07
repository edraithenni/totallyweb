'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SearchBox from '@/components/SearchBox'
import MovieCard from '@/components/MovieCard'
import Modal from '@/components/Modal'
import AuthForm from '@/components/AuthForm'
import { api, checkAuth } from '@/lib/api'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      await checkAuth()
      setIsLoggedIn(true)
    } catch {
      setIsLoggedIn(false)
    }
  }

  const searchMovies = async (query) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await api(`/api/movies/search?title=${encodeURIComponent(query)}`)
      setMovies(data.Search || data.movies || [])
    } catch (error) {
      console.error('Search error:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const openLoginModal = () => {
    setModalContent('login')
    setIsModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setIsModalOpen(false)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', 'POST')
      setIsLoggedIn(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        isLoggedIn={isLoggedIn}
        onLogin={openLoginModal}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <SearchBox onSearch={searchMovies} loading={loading} />
        
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id || movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
        
        {!loading && movies.length === 0 && (
          <div className="text-center text-white mt-8">
            Nothing to show
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent && (
          <AuthForm 
            mode={modalContent} 
            onSuccess={handleAuthSuccess}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  )
}