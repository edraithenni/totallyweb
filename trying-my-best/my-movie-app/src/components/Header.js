'use client'
import Link from 'next/link'

export default function Header({ isLoggedIn, onLogin, onRegister, onLogout }) {
  return (
    <header 
      className="h-32 bg-repeat-x bg-top flex items-center px-4"
      style={{
        backgroundImage: "url('/src/hat.png')",
        backgroundSize: 'auto'
      }}
    >
      <h1 className="text-5xl font-bold px-4 text-purple-600 font-so-bad
                    [-webkit-text-stroke:2px_#ffc659] 
                    [text-shadow:-2px_-2px_0_#fb5255,2px_-2px_0_#fb5255,-2px_2px_0_#fb5255,2px_2px_0_#fb5255]">
        Totally cats
      </h1>
      
      <nav className="ml-auto flex gap-2">
        {!isLoggedIn ? (
          <>
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-purple-600 text-cyan-300 border-2 border-yellow-400 outline-2 outline-red-500 outline-offset-0 font-so-bad"
            >
              Sign in
            </button>
            <Link 
              href="/auth"
              className="px-4 py-2 bg-purple-600 text-cyan-300 border-2 border-yellow-400 outline-2 outline-red-500 outline-offset-0 font-so-bad"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            <Link 
              href="/profile"
              className="px-4 py-2 bg-purple-600 text-cyan-300 border-2 border-yellow-400 outline-2 outline-red-500 outline-offset-0 font-so-bad"
            >
              Profile
            </Link>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-purple-600 text-cyan-300 border-2 border-yellow-400 outline-2 outline-red-500 outline-offset-0 font-so-bad"
            >
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  )
}