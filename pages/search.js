import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchMovies() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/search?title=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMovies(data.Search || []);
    } catch {
      alert('Ошибка поиска');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: '"So Bad", sans-serif', background: '#000', color: '#8dd9ff', minHeight: '100vh' }}>
      <header style={{ background: 'url(/src/hat.png) repeat center top', height: 120, display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#584fdb', textShadow: '-1px -1px 0 #ffc659, 1px -1px 0 #ffc659, -1px 1px 0 #ffc659, -2px -2px 0 #fb5255, 2px -2px 0 #fb5255, -2px 2px 0 #fb5255, 2px 2px 0 #fb5255' }}>
          Totally cats
        </h1>
      </header>

      <div style={{ maxWidth: 600, margin: '2rem auto', display: 'flex', gap: '.5rem' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchMovies()}
          placeholder="Enter movie title..."
          style={{ flex: 1, padding: '.6rem 1rem', border: '1px solid #ccc', backgroundColor: '#cd77ff', color: '#8dd9ff' }}
        />
        <button onClick={searchMovies} style={{ background: '#584fdb', color: '#8dd9ff', padding: '.6rem 1rem' }}>
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '1rem',
          }}
        >
          {movies.map((m) => (
            <div
              key={m.id}
              style={{ background: '#8dd9ff', color: '#cd77ff', cursor: 'pointer' }}
              onClick={() => (window.location.href = `/details?id=${m.id}`)}
            >
              <img
                src={m.poster || '/src/posternotfound.png'}
                alt="poster"
                style={{ width: '100%', height: 300, objectFit: 'cover' }}
              />
              <div style={{ padding: '.8rem' }}>
                <div>{m.title}</div>
                <div>{m.year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
