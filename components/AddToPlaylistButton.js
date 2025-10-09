import { useState } from 'react';

export default function AddToPlaylistButton({ movieId, movieTitle }) {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('')
  
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

  // Безопасный рендеринг плейлистов
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
            <span className="playlist-name">{playlist.name || playlist.Name || 'Unnamed Playlist'}</span>
            <button 
              onClick={() => addToPlaylist(playlist.id || playlist.ID)}
              className="add-btn"
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Add'}
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
        <span className="btn-icon"></span>
        <span className="btn-text">Add to Playlist</span>
        <div className="btn-gradient"></div>
      </button>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowPlaylistModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Playlist</h3>
              <p className="movie-title">"{movieTitle}"</p>
            </div>
            
            {/* Display error message */}
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="create-playlist-section">
              <h4>Create New</h4>
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
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            <div className="existing-playlists">
              <h4>Your Playlists</h4>
              {renderPlaylists()}
            </div>

            <div className="modal-actions">
              <button 
                className="close-modal"
                onClick={() => setShowPlaylistModal(false)}
                disabled={isLoading}
              >
                Close
              </button>
              <button 
                className="reload-btn"
                onClick={loadUserPlaylists}
                disabled={isLoading}
              >
                Reload Playlists
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
          position: relative;
          background: linear-gradient(135deg, #fb5255 0%, #d03e78 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 0px;
          font-family: 'Basiic', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          min-width: 160px;
          justify-content: center;
        }

        .add-to-playlist-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .add-to-playlist-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .add-to-playlist-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-gradient {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .add-to-playlist-btn:hover .btn-gradient {
          left: 100%;
        }

        .btn-icon {
          font-size: 18px;
        }

        .btn-text {
          position: relative;
          z-index: 1;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid;
          border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
          padding: 30px;
          border-radius: 0px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          color: #e2e8f0;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 1px solid #2d3748;
          padding-bottom: 15px;
        }

        .modal-header h3 {
          color: #667eea;
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .movie-title {
          color: #a0aec0;
          margin: 0;
          font-size: 14px;
          font-style: italic;
        }

        .error-message {
          background: rgba(245, 101, 101, 0.1);
          border: 1px solid #f56565;
          color: #feb2b2;
          padding: 12px;
          border-radius: 0px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.4;
        }

        .create-playlist-section {
          margin-bottom: 25px;
        }

        .create-playlist-section h4 {
          color: #68d391;
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .create-playlist-input {
          display: flex;
          gap: 10px;
        }

        .create-playlist-input input {
          flex: 1;
          padding: 12px;
          background: #2d3748;
          border: 1px solid #4a5568;
          border-radius: 0px;
          color: white;
          font-family: 'Basiic', sans-serif;
          transition: all 0.3s ease;
        }

        .create-playlist-input input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .create-playlist-input input:disabled {
          opacity: 0.6;
        }

        .create-btn, .add-btn {
          background: linear-gradient(135deg, #68d391 0%, #48bb78 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 0px;
          cursor: pointer;
          font-family: 'Basiic', sans-serif;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .create-btn:hover:not(:disabled), .add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(104, 211, 145, 0.3);
        }

        .create-btn:disabled, .add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .existing-playlists h4 {
          color: #f6ad55;
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .no-playlists {
          text-align: center;
          color: #a0aec0;
          font-style: italic;
          padding: 20px;
          background: rgba(45, 55, 72, 0.5);
          border-radius: 0px;
        }

        .playlist-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #4a5568;
          border-radius: 0px;
          background: #2d3748;
        }

        .playlist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid #4a5568;
          transition: background 0.3s ease;
        }

        .playlist-item:hover {
          background: rgba(74, 85, 104, 0.3);
        }

        .playlist-item:last-child {
          border-bottom: none;
        }

        .playlist-name {
          color: #e2e8f0;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .close-modal {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
          color: white;
          border: none;
          border-radius: 0px;
          cursor: pointer;
          font-family: "So Bad", sans-serif;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .reload-btn {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #d69e2e 0%, #ed8936 100%);
          color: white;
          border: none;
          border-radius: 0px;
          cursor: pointer;
          font-family: "So Bad", sans-serif;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .close-modal:hover:not(:disabled),
        .reload-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
        }

        .close-modal:disabled,
        .reload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Scrollbar styling */
        .playlist-list::-webkit-scrollbar {
          width: 6px;
        }

        .playlist-list::-webkit-scrollbar-track {
          background: #2d3748;
        }

        .playlist-list::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 0px;
        }

        .playlist-list::-webkit-scrollbar-thumb:hover {
          background: #764ba2;
        }
      `}</style>
    </>
  );
}