'use client'
import Link from 'next/link'

export default function MovieCard({ movie }) {
  const defaultPoster = '/static/src/posternotfound.png'
  
  return (
    <Link href={`/details/${movie.id}`}>
      <div className="bg-cyan-300 text-purple-400 outline-2 outline-purple-500 cursor-pointer transition-transform hover:scale-105">
        <img 
          src={movie.poster && movie.poster !== 'N/A' ? movie.poster : defaultPoster}
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
        <div className="p-4 flex flex-col justify-between">
          <h3 className="font-bold text-lg">{movie.title}</h3>
          <div>{movie.year || '—'}</div>
        </div>
      </div>
    </Link>
  )
}