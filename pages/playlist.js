import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Header from "../components/header";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from "next/router";

export default function PlaylistPage() {
  const { t } = useTranslation(['playlist', 'common', 'components']);
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
  //const [isClient, setIsClient] = useState(false);

  
  

  //const params = isClient ? new URLSearchParams(window.location.search) : null;
  //const playlistId = params?.get("id");
  const router = useRouter();
  const { id: playlistId } = router.query;


  function goToMovie(movieId) {
    if (!movieId) return alert(t('playlist:messages.missingMovieId'));
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
        toast.success(t('playlist:messages.saveSuccess'));
      } else {
        toast.error(t('playlist:messages.saveError'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('playlist:messages.saveNetworkError'));
    }
  }

  useEffect(() => {
  if (!playlistId) return;

  async function loadPlaylist() {
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
    if (!movies.length) {
      toast.error(t('playlist:messages.randomPickError'));
      return;
    }
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
    if (!confirm(t('playlist:messages.confirmRemoveMovie'))) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}/movies/${movieId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.ID !== movieId));
        toast.success(t('playlist:messages.movieRemoved'));
      } else {
        toast.error(t('playlist:messages.failedRemoveMovie'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('playlist:messages.errorRemovingMovie'));
    }
  }

  async function deletePlaylist(){
    if(!confirm(t('playlist:messages.confirmDeletePlaylist'))) return;
    try{
      const res = await fetch(`api/playlists/${playlistId}`, {
        method : "DELETE",
        credentials : "include",
      });
      if(res.ok){
        toast.success(t('playlist:messages.playlistDeleted'));
        setTimeout(() =>{
           window.location.assign("/profile");
        }, 2500);
      }else{
        toast.error(t('playlist:messages.failedDeletePlaylist'));
      }
    }catch(err) {
      console.error(err);
      toast.error(t('playlist:messages.errorDeletingPlaylist'));
    }
  }

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
    if (isDefaultPlaylist) return;
    if (currentUserId !== playlistOwnerId) return;
    setPreviewUrl(coverUrl);
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadStatus(t('playlist:messages.selectImageFile'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus(t('playlist:messages.fileTooBig'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setUploadStatus(t('playlist:messages.uploading'));
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
      setUploadStatus(t('playlist:messages.coverUpdated'));
    } catch {
      setUploadStatus(t('playlist:messages.errorUploading'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm(t('playlist:messages.confirmDeleteCover'))) return;
    setUploadStatus(t('playlist:messages.deleting'));
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
      setUploadStatus(t('playlist:messages.coverDeleted'));
    } catch {
      setUploadStatus(t('playlist:messages.errorDeleting'));
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
        <title>{playlist?.name || t('playlist:page.title')}</title>
        <link href="https://fonts.cdnfonts.com/css/so-normal" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Liberation+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      {randomMovie && (
        <div className={`random-result ${spinning ? "spinning" : "final"}`}>
          <h2>{t('playlist:randomPicker.youGot')}</h2>
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
            alt={t('playlist:playlistInfo.coverAlt')}
            onClick={onCoverClick}
          />
          <div className="playlist-info">
            <h1 id="playlist-name">{playlist?.name || t('playlist:page.loading')}</h1>
            <p id="playlist-owner">{t('playlist:playlistInfo.by')} {playlist?.owner_name || `${t('common:user')} ${playlist?.ownerId}`}</p>
            <p id="movie-count">{movies.length} {t('playlist:playlistInfo.moviesCount')}</p>
            {currentUserId === playlistOwnerId && !["watch-later", "watched", "liked"].includes(playlist?.name) &&(
              <button className="delete-playlist-btn" onClick={deletePlaylist}>
                {t('playlist:buttons.deletePlaylist')}
              </button>            
            )}
          </div>
          {playlist?.name === "watch-later" && movies.length > 0 && (
            <button
              className="pick-random-btn"
              disabled={spinning}
              onClick={handlePickRandom}
            >
              {spinning ? t('playlist:buttons.spinning') : t('playlist:buttons.pickRandom')}
            </button>
          )}
        </div>
        <div className="movies-list" id="movies">
          {movies.length === 0 ? (
            <p style={{ 
              textAlign: "center", 
              color: "#9C9CC9", 
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center" 
            }}>
              <img
                src="/src/lain_eyes_by_kicked_in_teeth-db91rfu.gif" 
                alt={t('playlist:page.noMovies')}
                style={{ width: "150px", marginBottom: "0.5rem" }}
              />
              {t('playlist:page.noMovies')}
            </p>
          ) : (
            movies.map((movie) => (
              <div className="movie-item" key={movie.ID}>
                {currentUserId === playlistOwnerId && (
                  <button
                    className="remove-movie-btn"
                    onClick={() => removeMovieFromPlaylist(movie.ID)}
                  >
                    {t('playlist:buttons.removeMovie')}
                  </button>
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
                    <div className="movie-meta">{movie.year || movie.release_year || t('playlist:page.unknownYear')}</div>
                    {movie.rating && (
                      <div className="rating">
                        {Array.from({ length: 10 }, (_, i) => (
                          <span key={i} className={i < Math.floor(movie.rating) ? "star filled" : "star"}>
                            {t('playlist:rating.stars')}
                          </span>
                        ))}
                        <span className="rating-text">{movie.rating}{t('playlist:movieInfo.rating')}</span>
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
                        <button className="btn btn-save" onClick={() => saveDescription(movie.ID)}>
                          {t('playlist:buttons.save')}
                        </button>
                        <button className="btn btn-cancel" onClick={() => setEditingMovie(null)}>
                          {t('playlist:buttons.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`movie-description ${!movie.description ? "empty" : ""}`}
                      onClick={() => currentUserId === playlistOwnerId && (setEditingMovie(movie.ID), setEditText(movie.description || ""))}
                    >
                      {escapeHtml(
                        movie.description ||
                        (currentUserId === playlistOwnerId ? t('playlist:buttons.editDescription') : "")
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
            <h2>{t('playlist:modal.coverTitle')}</h2>
            <img
              src={previewUrl || getDefaultCover()}
              alt={t('playlist:modal.previewAlt')}
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
                {t('playlist:buttons.uploadCover')}
              </button>
              {playlist?.cover && playlist.cover !== getDefaultCover() && (
                <button onClick={handleDeleteCover} className="btn btn-cancel">
                  {t('playlist:buttons.deleteCover')}
                </button>
              )}
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                {t('playlist:buttons.close')}
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

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          font-size: 1.2rem;
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
          position: relative;
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
          cursor: pointer;
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
          cursor: ${props => props.currentUserId === props.playlistOwnerId ? 'pointer' : 'default'};
        }
        .movie-description:hover {
          border: var(--border-primary);
          box-shadow: var(--glow-medium);
          background: #2C000A;
          color: #8228d5;
          background: linear-gradient(
              to right,
              #2C000A 0%,
              #2C000A 87.33%,
              #233007 100%
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

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .delete-playlist-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--terminal-red);
          color: black;
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
      `}</style>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'playlist',
        'common',
        'components',
        'modal'
      ])),
    },
  };
}
