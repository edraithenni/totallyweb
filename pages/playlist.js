import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/header";

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [playlistOwnerId, setPlaylistOwnerId] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editText, setEditText] = useState("");

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const playlistId = params?.get("id");

  function goToMovie(movieId) {
    if (!movieId) return alert("Movie ID is missing");
    window.location.href = `/details?id=${encodeURIComponent(movieId)}`;
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  async function saveDescription(movieId) {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/movies/${movieId}/description`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: editText }),
      });
      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) =>
            m.ID === movieId ? { ...m, description: editText } : m
          )
        );
        setEditingMovie(null);
      } else {
        alert("Failed to save description");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving description");
    }
  }

  useEffect(() => {
    async function loadPlaylist() {
      if (!playlistId) return;

      try {
        const meRes = await fetch("/api/users/me", { credentials: "include" });
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUserId(me.id);
        }

        const res = await fetch(`/api/playlists/${playlistId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load playlist");
        const data = await res.json();
        setPlaylist(data);
        setPlaylistOwnerId(data.owner_id);
        setMovies(data.movies || data.Movies || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadPlaylist();
  }, [playlistId]);

  return (
    <>
      <Head>
        <title>{playlist?.name || "Playlist"}</title>
        <link href="https://fonts.cdnfonts.com/css/so-normal" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Liberation+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <div className="playlist-container">
        <div className="playlist-header">
          <img
            id="playlist-cover"
            src={playlist?.cover || "/static/playlists/collection-placeholder.png"}
            alt="Playlist Cover"
          />
          <div className="playlist-info">
            <h1 id="playlist-name">{playlist?.name || "Loading..."}</h1>
            <p id="playlist-owner">By {playlist?.owner_name || `User ${playlist?.owner_id}`}</p>
            <p id="movie-count">{movies.length} movies</p>
          </div>
        </div>
        <div className="movies-list" id="movies">
          {movies.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9C9CC9", padding: "40px" }}>
              No movies in this playlist yet
            </p>
          ) : (
            movies.map((movie) => (
              <div className="movie-item" key={movie.ID}>
                <img
                  src={movie.poster || movie.poster_url || "/static/movies/poster-placeholder.png"}
                  alt={movie.title}
                  className="movie-poster"
                  onClick={() => goToMovie(movie.ID)}
                />
                <div className="movie-content">
                  <div className="movie-header">
                    <h3 className="movie-title" onClick={() => goToMovie(movie.ID)}>
                      {escapeHtml(movie.title)}
                    </h3>
                    <div className="movie-meta">{movie.year || movie.release_year || "Unknown year"}</div>
                    {movie.rating && (
                        <div className="rating">
                         {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} className={i < Math.floor(movie.rating) ? "star filled" : "star"}>★</span>
                            ))}
                            <span className="rating-text">{movie.rating}/10</span>
                        </div>
                    )}

                    <div className="movie-meta">{movie.genres || ""}</div>
                  </div>

                  {editingMovie === movie.ID ? (
                    <div className="edit-wrapper">
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => saveDescription(movie.ID)}
                        onKeyDown={(e) => e.key === "Enter" && saveDescription(movie.ID)}
                      />
                      <div className="edit-buttons">
                        <button className="btn btn-save" onClick={() => saveDescription(movie.ID)}>Save</button>
                        <button className="btn btn-cancel" onClick={() => setEditingMovie(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`movie-description ${!movie.description ? "empty" : ""}`}
                      onClick={() => currentUserId === playlistOwnerId && (setEditingMovie(movie.ID), setEditText(movie.description || ""))}
                    >
                      {escapeHtml(movie.description || "No description added yet. Click to edit.")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&family=IBM+Plex+Mono&display=swap');
  :root {
    --terminal-green: #8a2be2;
    --terminal-dim-green: #5e1c99;
    --terminal-blue: #00ccff;
    --terminal-red: #ff0033;
    --terminal-purple: #BD00EC;
    --terminal-dim-purple: #880088;

    --bg-primary: #000000;
    --bg-secondary: #0a0a0a;
    --bg-panel: rgba(15, 0, 20, 0.85);
    --bg-inset: rgba(8, 0, 15, 0.7);

    --text-primary: var(--terminal-green);
    --text-secondary: var(--terminal-dim-green);
    --text-highlight: #ffffff;
    --text-glitch: var(--terminal-red);

    --glow-strong: 0 0 10px rgba(138, 43, 226, 0.7), 0 0 20px rgba(138, 43, 226, 0.5);
    --glow-medium: 0 0 8px rgba(138, 43, 226, 0.5);
    --glow-weak: 0 0 5px rgba(138, 43, 226, 0.3);
    --glow-terminalred: 0 0 5px rgba(255, 0, 51, 0.7);

    --border-primary: 1px solid var(--terminal-dim-green);
    --border-secondary: 1px solid rgba(138, 43, 226, 0.3);

    --font-terminal: 'VT323', 'Share Tech Mono', monospace;
    --font-header: 'VT323', 'Share Tech Mono', monospace;
    --font-body: 'IBM Plex Mono', 'Courier New', monospace;
    --font-terminal1: 'VT323', 'Share Tech Mono', 'IBM Plex Mono', monospace;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-terminal);
    line-height: 1.5;
  }

  a {
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s;
  }
  a:hover {
    color: var(--text-highlight);
    text-shadow: var(--glow-medium);
  }

  button, .button {
    background-color: var(--bg-inset);
    color: var(--text-primary);
    border: var(--border-secondary);
    padding: 0.5rem 1rem;
    font-family: var(--font-terminal);
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover, .button:hover {
    border: var(--border-primary);
    color: var(--text-highlight);
    box-shadow: var(--glow-medium);
  }

  .playlist-container {
    max-width: 900px;
    margin: 2rem auto;
    background: var(--bg-panel);
    border: var(--border-secondary);
    box-shadow: var(--glow-medium);
    padding: 1.5rem;
  }

  .playlist-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .playlist-info h1 {
    color: #82007D;
    font-size: 2rem;
    text-shadow: var(--glow-medium);
    
    font-family: var(--font-body);
  }

  .playlist-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .movies-list {
    display: grid;
    gap: 1rem;
  }

  .movie-item {
    display: flex;
    gap: 1rem;
    background: var(--bg-inset);
    border: var(--border-secondary);
    transition: all 0.3s;
    padding: 1rem;
  }
 .movie-item:hover {
  border: 1px solid #040F04;
  background: #040F04;
  box-shadow: 0 0 10px #040F04(74, 124, 89, 0.5), 0 0 20px #040F04(74, 124, 89, 0.3);
  transform: scale(1.02);
  transition: all 0.3s ease-in-out;
}

  .movie-poster {
    width: 100px;
    height: 150px;
    object-fit: cover;
    border: var(--border-secondary);
  }

  .movie-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .movie-title {
    color: var(--text-primary);
    font-size: 1.2rem;
    cursor: pointer;
    text-shadow: var(--glow-medium);
  }
  .movie-title:hover {
    color: var(--terminal-purple);
    text-shadow: 0 0 10px #ff0033;
  }

  .movie-meta {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.2rem;
  }

  .movie-description {
    margin-top: 0.5rem;
    background: var(--bg-inset);
    border: var(--border-secondary);
    padding: 0.7rem;
    color: #CCADF2;
    transition: all 0.2s;
  }
  .movie-description:hover {
    border: var(--border-primary);
    box-shadow: var(--glow-medium);
    background: #2C000A;
    color: #8228d5;
    background: linear-gradient(
        to right,
        #2C000A 0%,             /* основной цвет */
        #2C000A 87.33%,         /* 5/6 основной цвет */
        #233007 100%            /* цвет справа */
    );
  }

  .edit-wrapper textarea {
    width: 100%;
    font-family: var(--font-terminal);
    background: var(--bg-inset);
    border: var(--border-primary);
    color: var(--text-highlight);
    padding: 0.5rem;
    transition: all 0.2s;
  }
  .edit-wrapper textarea:focus {
  border: 1px solid #2b0f18;
  background-color: #040F04;
  color: #ff0033;
  box-shadow:
    0 0 8px rgba(0, 255, 153, 0.4),
    inset 0 0 6px rgba(43, 15, 24, 0.6);
  text-shadow: 0 0 4px rgba(0, 255, 153, 0.4);
}

  .btn {
    background: transparent;
    border: var(--border-secondary);
    color: var(--text-primary);
    transition: all 0.2s;
  }
  .btn:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
    box-shadow: var(--glow-medium);
  }

  .empty-list {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem;
  }
    .rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 1rem;
}

.rating .star {
  color: #040F04; 
  text-shadow: 0 0 10px #ff0033;
}

.rating .star.filled {
  color: #BE00ED;
  text-shadow: 0 0 10px #ff0033;
}

.rating-text {
  color: #CCADF2;
  font-size: 0.9rem;
  margin-left: 0.3rem;
}


`}</style>

    </>
  );
}
