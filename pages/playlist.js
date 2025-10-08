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
                    {movie.rating && <div className="rating">⭐ {movie.rating}/10</div>}
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

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Liberation Mono', monospace; background: #000; color: #c9c9c9; }
        .playlist-container { max-width: 900px; margin: 20px auto; background: #1a1a1a; border: 1px solid #333; box-shadow: 0 0 10px rgba(74,158,255,0.2); overflow: hidden; }
        .playlist-header { display: flex; align-items: center; gap: 10px; padding: 10px; background: #3b3b3b; border-bottom: 1px solid #333; color: #fff; }
        .playlist-info h1 { font-weight: bold; font-size: 16px; color: #fff; }
        .playlist-info p { color: #c9c9c9; font-size: 12px; }
        .movies-list { display: grid; grid-template-columns: 1fr; gap: 10px; padding: 10px; background: #0f0f0f; max-height: 70vh; overflow-y: auto; }
        .movie-item { display: flex; gap: 10px; padding: 10px; background: #1a1a1a; border: 1px solid #333; cursor: pointer; transition: all 0.2s; }
        .movie-item:hover { border-color: #434642; box-shadow: 0 0 5px rgba(74,158,255,0.2); transform: scale(1.02); }
        .movie-poster { width: 100px; height: 150px; object-fit: cover; border: 1px solid #333; }
        .movie-content { flex: 1; display: flex; flex-direction: column; }
        .movie-title { font-weight: bold; color: #fff; font-size: 13px; cursor: pointer; margin-bottom: 5px; }
        .movie-title:hover { color: #6758f7ff; text-shadow: 0 0 4px rgba(88, 79, 219, 0.5); }
        .movie-meta { font-size: 11px; color: #888; margin-bottom: 5px; }
        .movie-description { font-size: 11px; line-height: 1.5; margin-top: 5px; padding: 6px; background: #0f0f0f; border: 1px solid #333; color: #c9c9c9; cursor: pointer; }
        .edit-wrapper { display: flex; flex-direction: column; gap: 5px; }
        .edit-wrapper textarea { width: 100%; background: #0f0f0f; border: 1px solid #584fdb; color: #c9c9c9; padding: 6px; font-family: 'Liberation Mono', monospace; font-size: 12px; }
        .edit-wrapper textarea:focus { outline: none; border-color: #8dd9ff; box-shadow: 0 0 6px rgba(88, 79, 219, 0.4); }
        .edit-buttons { display: flex; gap: 5px; margin-top: 5px; }
        .btn { background: #333; color: #c9c9c9; border: 1px solid #555; padding: 6px 12px; font-size: 11px; cursor: pointer; }
        .btn:hover { background: #434642; color: #fff; border-color: #434642; }
      `}</style>
    </>
  );
}
