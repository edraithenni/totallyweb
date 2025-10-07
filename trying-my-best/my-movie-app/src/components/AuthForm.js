'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

export default function AuthForm({ mode, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.target)
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const response = await api(`/api/auth/${mode}`, 'POST', data)
      
      if (response.success || response.user) {
        onSuccess()
      } else {
        setError(response.message || 'Authentication failed')
      }
    } catch (error) {
      setError(error.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-so-bad">
        {mode === 'login' ? 'Sign in' : 'Sign up'}
      </h2>
      
      {error && (
        <div className="bg-red-500 text-white p-2 mb-4 font-so-bad">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="p-3 border border-cyan-400 bg-cyan-400 text-black placeholder-gray-600 font-so-bad"
          style={{ borderRadius: 0 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="p-3 border border-cyan-400 bg-cyan-400 text-black placeholder-gray-600 font-so-bad"
          style={{ borderRadius: 0 }}
        />
        <button 
          type="submit"
          disabled={loading}
          className="p-3 bg-teal-600 text-black font-so-bad border-0 cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}