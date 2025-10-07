'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.target)
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name')
    }

    try {
      await api('/api/auth/register', 'POST', data)
      router.push('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-blue-900 p-8 max-w-md w-full mx-4 outline-2 outline-cyan-400 text-cyan-400">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="p-3 border border-cyan-400 bg-cyan-400 text-black"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="p-3 border border-cyan-400 bg-cyan-400 text-black"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="p-3 border border-cyan-400 bg-cyan-400 text-black"
          />
          <button 
            type="submit"
            disabled={loading}
            className="p-3 bg-teal-600 text-black font-sans cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-cyan-300 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}