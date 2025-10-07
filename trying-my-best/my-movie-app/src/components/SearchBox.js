'use client'
import { useState } from 'react'

export default function SearchBox({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2 my-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter movie title..."
        className="flex-1 px-4 py-2 border border-gray-300 bg-purple-400 text-cyan-300 placeholder-cyan-300 font-so-bad caret-cyan-300"
        style={{ borderRadius: 0 }}
      />
      <button 
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-purple-600 text-cyan-300 font-so-bad border-0"
        style={{ borderRadius: 0 }}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}