import { useState } from 'react';

export default function AddToPlaylistButton({ movieId, movieTitle }) {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const openModal = async () => {
    setShowPlaylistModal(true);
    setError('');
    await loadUserPlaylists();
  };

  const loadUserPlaylists = async () => {
    try {
      console.log('Loading playlists via rewrite...');
      const res = await fetch('/api/users/me/playlists', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Playlists response status:', res.status, res.statusText);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Playlists API response:', data);
        
        let playlistsArray = [];
        
        if (Array.isArray(data)) {
          playlistsArray = data;
        } else if (data && Array.isArray(data.playlists)) {
          playlistsArray = data.playlists;
        } else if (data && data.data && Array.isArray(data.data)) {
          playlistsArray = data.data;
        } else if (data && typeof data === 'object') {
          playlistsArray = Object.values(data).find(val => Array.isArray(val)) || [];
        }
        
        console.log('Extracted playlists:', playlistsArray);
        setPlaylists(playlistsArray);
        
      } else {
        const errorText = await res.text();
        console.error('Failed to load playlists:', res.status, errorText);
        setError(`Failed to load playlists: ${res.status} ${res.statusText}`);
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Network error loading playlists:', error);
      setError('Network error loading playlists. Please try again.');
      setPlaylists([]);
    }
  };

  const addToPlaylist = async (playlistId) => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Adding movie to playlist:', { playlistId, movieId });
      
      const res = await fetch(`/api/playlists/${playlistId}/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ movie_id: parseInt(movieId) })
      });

      console.log('Add to playlist response status:', res.status, res.statusText);

      if (res.ok) {
        const result = await res.json();
        console.log('Add to playlist success:', result);
        alert("Movie added to playlist!");
        setShowPlaylistModal(false);
      } else {
        const errorText = await res.text();
        console.error('Add to playlist failed:', res.status, errorText);
        setError(`Failed to add to playlist: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Network error adding to playlist:', error);
      setError('Network error adding to playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      console.log('Creating playlist:', newPlaylistName);
      
      const res = await fetch('/api/playlists', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newPlaylistName })
      });

      console.log('Create playlist response status:', res.status, res.statusText);

      if (res.ok) {
        const newPlaylist = await res.json();
        console.log('Playlist created successfully:', newPlaylist);
        
        await addToPlaylist(newPlaylist.id);
        setNewPlaylistName("");
        await loadUserPlaylists();
        
      } else {
        let errorMessage = `Failed to create playlist: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage += ` - ${errorData.error || JSON.stringify(errorData)}`;
        } catch {
          const errorText = await res.text();
          errorMessage += ` - ${errorText}`;
        }
        console.error('Create playlist failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Network error creating playlist:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlaylists = () => {
    if (!Array.isArray(playlists)) {
      console.warn('Playlists is not an array:', playlists);
      return <p className="no-playlists">No playlists available</p>;
    }

    if (playlists.length === 0) {
      return <p className="no-playlists">No playlists yet. Create one above! ✨</p>;
    }

    return (
      <div className="playlist-list">
        {playlists.map(playlist => (
          <div key={playlist.id || playlist.ID} className="playlist-item">
            <span className="playlist-name">
              {playlist.name || playlist.Name || 'Unnamed Playlist'}
            </span>
            <button 
              onClick={() => addToPlaylist(playlist.id || playlist.ID)}
              className="add-btn"
              disabled={isLoading}
              title="Add to this playlist"
            >
              {isLoading ? '...' : '+'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <button 
        className="add-to-playlist-btn"
        onClick={openModal}
        disabled={isLoading}
      >
        <span className="btn-icon">+</span>
        <span className="btn-text">Add to Playlist</span>
      </button>

      {showPlaylistModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowPlaylistModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal-btn"
              onClick={() => setShowPlaylistModal(false)}
              disabled={isLoading}
            >
              ×
            </button>
            
            <div className="modal-header">
              <h3>Add to Playlist</h3>
              <p className="movie-title">"{movieTitle}"</p>
            </div>
            
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="create-playlist-section">
              <h4>Create New Playlist</h4>
              <div className="create-playlist-input">
                <input
                  type="text"
                  placeholder="Enter playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewPlaylist()}
                  disabled={isLoading}
                />
                <button 
                  onClick={createNewPlaylist}
                  className="create-btn"
                  disabled={isLoading || !newPlaylistName.trim()}
                >
                  {isLoading ? '...' : 'Create'}
                </button>
              </div>
            </div>

            <div className="existing-playlists">
              <h4>Your Playlists</h4>
              {renderPlaylists()}
            </div>

            <div className="modal-actions">
              <button 
                className="reload-btn"
                onClick={loadUserPlaylists}
                disabled={isLoading}
              >
                ↻ Reload
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .add-to-playlist-btn {
          background: #000;
          color: #727d79;
          border: 1px solid #727d79;
          padding: 8px 16px;
          border-radius: 0;
          font-family: 'Basiic', sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .add-to-playlist-btn:hover:not(:disabled) {
          background: #292626ff;
          color: #d2ece3;
          border-color: #d2ece3;
        }

        .add-to-playlist-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: #262123ff;
          border: 1px solid #727d79;
          padding: 24px;
          border-radius: 0;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          color: #9c9cc9;
          position: relative;
        }

        .close-modal-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          color: #d2ece3;
          cursor: pointer;
          font-size: 24px;
          font-weight: bold;
          background: none;
          border: none;
          line-height: 1;
          transition: all 0.2s;
          z-index: 10;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-modal-btn:hover:not(:disabled) {
          color: #fff;
          transform: scale(1.1);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #727d79;
        }

        .modal-header h3 {
          color: #fff;
          margin: 0 0 8px 0;
          font-size: 20px;
        }

        .movie-title {
          color: #9c9cc9;
          margin: 0;
          font-size: 14px;
          font-style: italic;
        }

        .error-message {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          color: #ffb3b3;
          padding: 12px;
          border-radius: 0;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .create-playlist-section {
          margin-bottom: 24px;
        }

        .create-playlist-section h4,
        .existing-playlists h4 {
          color: #d2ece3;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .create-playlist-input {
          display: flex;
          gap: 8px;
        }

        .create-playlist-input input {
          flex: 1;
          padding: 10px 12px;
          background: #000;
          border: 1px solid #727d79;
          border-radius: 0;
          color: #d2ece3;
          font-family: 'Basiic', sans-serif;
          font-size: 14px;
        }

        .create-playlist-input input:focus {
          outline: none;
          border-color: #d2ece3;
        }

        .create-playlist-input input:disabled {
          opacity: 0.6;
        }

        .create-btn, .add-btn {
          background: #000;
          color: #727d79;
          border: 1px solid #727d79;
          cursor: pointer;
          font-family: 'Basiic', sans-serif;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .create-btn {
          padding: 10px 20px;
          font-size: 14px;
          min-width: 80px;
        }

        .add-btn {
          padding: 6px 12px;
          font-size: 16px;
          font-weight: bold;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }

        .create-btn:hover:not(:disabled), 
        .add-btn:hover:not(:disabled) {
          background: #292626ff;
          color: #d2ece3;
          border-color: #d2ece3;
        }

        .create-btn:disabled, 
        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .existing-playlists {
          margin-bottom: 24px;
        }

        .no-playlists {
          text-align: center;
          color: #727d79;
          font-style: italic;
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0;
          font-size: 14px;
        }

        .playlist-list {
          max-height: 250px;
          overflow-y: auto;
          border: 1px solid #727d79;
          background: #000;
        }

        .playlist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #727d79;
          transition: background 0.2s;
        }

        .playlist-item:hover {
          background: rgba(114, 125, 121, 0.1);
        }

        .playlist-item:last-child {
          border-bottom: none;
        }

        .playlist-name {
          color: #d2ece3;
          font-size: 15px;
          flex: 1;
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .reload-btn {
          background: #000;
          color: #727d79;
          border: 1px solid #727d79;
          padding: 8px 20px;
          border-radius: 0;
          cursor: pointer;
          font-family: 'Basiic', sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .reload-btn:hover:not(:disabled) {
          background: #292626ff;
          color: #d2ece3;
          border-color: #d2ece3;
        }

        .reload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .playlist-list::-webkit-scrollbar {
          width: 6px;
        }

        .playlist-list::-webkit-scrollbar-track {
          background: #000;
        }

        .playlist-list::-webkit-scrollbar-thumb {
          background: #727d79;
        }

        .playlist-list::-webkit-scrollbar-thumb:hover {
          background: #9c9cc9;
        }
      `}</style>
    </>
  );
}