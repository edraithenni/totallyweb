import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Header from "../components/header";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [playlistOwnerId, setPlaylistOwnerId] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editText, setEditText] = useState("");
  const [randomMovie, setRandomMovie] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

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
        setPlaylistOwnerId(data.ownerId);
        setMovies(data.movies || data.Movies || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadPlaylist();
  }, [playlistId]);
  
  async function handlePickRandom() {
  if (!movies.length) return;
  setSpinning(true);
  setRandomMovie(null);

  let spins = 20 + Math.floor(Math.random() * 10);
  let index = 0;

  const spinInterval = setInterval(() => {
    index = (index + 1) % movies.length;
    setRandomMovie(movies[index]);
  }, 100);

  setTimeout(() => {
    clearInterval(spinInterval);
    const winner = movies[Math.floor(Math.random() * movies.length)];
    setRandomMovie(winner);
    setSpinning(false);
  }, spins * 100);
}

async function removeMovieFromPlaylist(movieId) {
  if (!confirm("Remove this movie from the playlist?")) return;
  try {
    const res = await fetch(`/api/playlists/${playlistId}/movies/${movieId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setMovies((prev) => prev.filter((m) => m.ID !== movieId));
    } else {
      alert("Failed to remove movie");
    }
  } catch (err) {
    console.error(err);
    alert("Error removing movie");
  }
}

async function deletePlaylist(){
  if(!confirm("Delete this playlist?"))return;
  try{
    const res = await fetch(`api/playlists/${playlistId}`, {
      method : "DELETE",
      credentials : "include",
    });
    if(res.ok){
      toast.success("Playlist deleted!");
      setTimeout(() =>{
         window.location.assign("/profile");
      }, 2500);
     
      
    }else{
    alert("Failed to delete playlist");
    }
  }catch(err) {
    console.error(err);
    alert("Error removing playlist");
  }
}

  // определяем дефолтный плейлист
  const isDefaultPlaylist = ["watched", "watch-later", "liked"].includes(playlist?.name);

  const getDefaultCover = () => {
    switch (playlist?.name) {
      case "watched": return "/src/watched-playlist.jpg";
      case "watch-later": return "/src/watch-later-playlist.jpg";
      case "liked": return "/src/liked-playlist.jpg";
      default: return "/src/default-playlist.jpg";
    }
  };

  const coverUrl = playlist?.cover || getDefaultCover();

  const onCoverClick = () => {
    if (isDefaultPlaylist) return; // дефолтные не кликабельны
    if (currentUserId !== playlistOwnerId) return;
    setPreviewUrl(coverUrl);
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadStatus("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return setUploadStatus("File is too big (max 5MB).");

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setUploadStatus("Uploading...");
    const form = new FormData();
    form.append("cover", file);

    try {
      const resp = await fetch(`/api/users/me/playlists/${playlistId}/cover`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const data = await resp.json();
      const newCover = data?.cover || "/src/default-playlist.jpg";
      setPlaylist(prev => ({ ...prev, cover: newCover }));
      setPreviewUrl(newCover);
      setUploadStatus("Cover updated.");
    } catch {
      setUploadStatus("Error uploading cover.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm("Are you sure you want to delete the playlist cover?")) return;
    setUploadStatus("Deleting...");
    try {
      const resp = await fetch(`/api/users/me/playlists/${playlistId}/cover`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const data = await resp.json();
      const newCover = data?.cover || "/src/default-playlist.jpg";
      setPlaylist(prev => ({ ...prev, cover: newCover }));
      setPreviewUrl(newCover);
      setModalOpen(false);
      setUploadStatus("Cover deleted.");
    } catch {
      setUploadStatus("Error deleting cover.");
    } finally {
      setTimeout(() => setUploadStatus(""), 2500);
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
  }, [modalOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <Head>
        <title>{playlist?.name || "Playlist"}</title>
        <link href="https://fonts.cdnfonts.com/css/so-normal" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Liberation+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

    {randomMovie && (
        <div className={`random-result ${spinning ? "spinning" : "final"}`}>
            <h2>You got:</h2>
            <div className="random-card" onClick={() => goToMovie(randomMovie.ID)}>
            <img
                src={randomMovie.poster || randomMovie.poster_url || "/movies/poster-placeholder.png"}
                alt={randomMovie.title}
            />
            <h3>{randomMovie.title}</h3>
            </div>
        </div>
        )}

      <div className="playlist-container">
        <div className="playlist-header">
          <img
            id="playlist-cover"
            src={coverUrl}
            style={{ 
              width: "150px", 
              height: "150px", 
              objectFit: "cover", 
              borderRadius: "8px",
              cursor: isDefaultPlaylist ? "default" : (currentUserId === playlistOwnerId ? "pointer" : "default"),
              pointerEvents: isDefaultPlaylist ? "none" : "auto"
            }}
            alt="Playlist Cover"
            onClick={onCoverClick}
          />
          <div className="playlist-info">
            <h1 id="playlist-name">{playlist?.name || "Loading..."}</h1>
            <p id="playlist-owner">By {playlist?.owner_name || `User ${playlist?.ownerId}`}</p>
            <p id="movie-count">{movies.length} movies</p>
            {currentUserId === playlistOwnerId && !["watch-later", "watched", "liked"].includes(playlist?.name) &&(
            <button className="delete-playlist-btn"
            onClick={deletePlaylist}>
                Delete playlist
            </button>            
            )}
          </div>
          {playlist?.name === "watch-later" && movies.length > 0 && (
        <button
            className="pick-random-btn"
            disabled={spinning}
            onClick={handlePickRandom}
        >
       {spinning ? "Spinning..." : "Pick Random"}
        </button>
        )}

        </div>
        <div className="movies-list" id="movies">
          
          {movies.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9C9CC9", padding: "40px" }}>
              <img
              src="/src/_gif__static_tvs_by_notes28_dbozzsl-fullview.png" 
              alt="Empty playlist"
              style={{ width: "200px", marginBottom: "0.5rem" }}
            />
              <p>No movies in this playlist yet</p>
            </p>
          ) : (
            movies.map((movie) => (
              <div className="movie-item" key={movie.ID}>
                {currentUserId === playlistOwnerId && (
              <button
                className="remove-movie-btn"
                onClick={() => removeMovieFromPlaylist(movie.ID)}
              >Remove</button>
              )}
                <img
                  src={movie.poster || movie.poster_url || "/movies/poster-placeholder.png"}
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
                        {escapeHtml(
                        movie.description ||
                        (currentUserId === playlistOwnerId ? "No description added yet. Click to edit." : "")
                        )}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          

        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      {modalOpen && !isDefaultPlaylist && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Playlist Cover</h2>
            <img
              src={previewUrl || getDefaultCover()}
              alt="Preview"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
                margin: "20px 0"
              }}
            />
            <div className="upload-status">{uploadStatus}</div>
            <div className="avatar-options">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                Upload new cover
              </button>
              {playlist?.cover && playlist.cover !== getDefaultCover() && (
                <button onClick={handleDeleteCover} className="btn btn-cancel">
                  Delete cover
                </button>
              )}
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

.pick-random-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #100030;
  border: 1px solid #8a2be2;
  color: #ccadf2;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  font-family: var(--font-terminal);
  box-shadow: var(--glow-medium);
}
.pick-random-btn:hover {
  background: #2C000A;
  color: #BE00ED;
  box-shadow: 0 0 15px #233007;
}

.random-result {
  text-align: center;
  margin-top: 2rem;
  animation: fadeIn 0.4s ease-out;
}

.random-result h2 {
  color: #ff00cc;
  text-shadow: 0 0 10px #ff00cc, 0 0 20px #8a2be2;
}

.random-card {
  display: inline-block;
  margin-top: 1rem;
  border: 1px solid var(--border-primary);
  padding: 0.5rem;
  background: var(--bg-panel);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--glow-medium);
}
.random-card img {
  width: 150px;
  height: 220px;
  object-fit: cover;
  border: 1px solid var(--border-primary);
}
.random-card h3 {
  margin-top: 0.5rem;
  font-family: var(--font-terminal);
  color: #ccadf2;
  text-shadow: var(--glow-medium);
}
.random-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px #ff00cc;
  background: #040F04
}

.remove-movie-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #000;
  border: 1px solid #ff0033;
  color: #ff0033;
  font-family: var(--font-terminal);
  font-size: 0.8rem;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 5px #ff0033;
  z-index: 2;
}
.remove-movie-btn:hover {
  background: #ff0033;
  color: #000;
  box-shadow: 0 0 10px #ff0033;
  transform: scale(1.1);
}

.movie-item {
  position: relative; 
}

 

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.delete-playlist-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--terminal-red);
          color: black;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-panel);
  padding: 2rem;
  border-radius: 8px;
  border: var(--border-primary);
  text-align: center;
  box-shadow: var(--glow-medium);
  max-width: 90%;
  width: 400px;
}

.modal-content h2 {
  color: var(--text-primary);
  font-family: var(--font-terminal);
  margin-bottom: 1rem;
  text-shadow: var(--glow-medium);
}

.upload-status {
  color: var(--text-highlight);
  margin: 1rem 0;
  font-family: var(--font-terminal);
  text-shadow: var(--glow-weak);
}

.avatar-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.avatar-options button {
  padding: 0.5rem 1rem;
  font-family: var(--font-terminal);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--terminal-purple);
  border: 1px solid var(--terminal-dim-purple);
  color: black;
}

.btn-primary:hover {
  background: var(--terminal-dim-purple);
  box-shadow: var(--glow-medium);
}

.btn-cancel {
  background: var(--terminal-red);
  border: 1px solid #aa0000;
  color: black;
}

.btn-cancel:hover {
  background: #aa0000;
  box-shadow: var(--glow-terminalred);
}

.btn-secondary {
  background: var(--bg-secondary);
  border: var(--border-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
  box-shadow: var(--glow-medium);
}

.delete-playlist-btn {
  border: 1px solid var(--terminal-red);
  font-family: var(--font-terminal);
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: var(--glow-terminalred);
}

.delete-playlist-btn:hover {
  background: #ff3366;
  border-color: #ff3366;
  box-shadow: 0 0 15px var(--terminal-red);
  transform: scale(1.05);
}
      `}</style>
    </>
  );
}
