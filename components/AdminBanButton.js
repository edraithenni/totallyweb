import { useState, useEffect } from 'react';

export default function AdminBanButton({ targetUserId }) {
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBanStatus();
  }, [targetUserId]);

  const checkBanStatus = async () => {
    try {
      const res = await fetch(`/api/admin/users/${targetUserId}/banned`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setIsBanned(data.banned || false);
      }
    } catch (err) {
      console.error('Failed to check ban status:', err);
    }
  };

  const handleBanAction = async () => {
    setLoading(true);
    try {
      const endpoint = isBanned 
        ? `/api/admin/users/${targetUserId}/unban`
        : `/api/admin/users/${targetUserId}/ban`;
      
      const method = 'POST';
      
      const res = await fetch(endpoint, {
        method,
        credentials: 'include'
      });

      if (res.ok) {
        setIsBanned(!isBanned);
      }
    } catch (err) {
      console.error('Failed to update ban status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBanAction}
      disabled={loading}
      className={`admin-ban-btn ${isBanned ? 'unban' : 'ban'}`}
      title={isBanned ? 'Unban this user' : 'Ban this user'}
    >
      {loading ? '...' : (isBanned ? 'Unban User' : 'Ban User')}
      
      <style jsx>{`
        .admin-ban-btn {
          background: #000;
          color: #727d79;
          border: 1px solid #727d79;
          padding: 0.45rem 0.75rem;
          border-radius: 0;
          font-family: 'Basiic', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 0.5rem;
        }
        
        .admin-ban-btn:hover:not(:disabled) {
          background: #292626ff;
          border-color: #ff4444;
          color: #ff4444;
        }
        
        .admin-ban-btn.ban:hover:not(:disabled) {
          border-color: #ff4444;
          color: #ff4444;
        }
        
        .admin-ban-btn.unban {
          color: #ffb3ff;
          border-color: #ffb3ff;
        }
        
        .admin-ban-btn.unban:hover:not(:disabled) {
          background: #292626ff;
          border-color: #ff99ff;
          color: #ff99ff;
        }
        
        .admin-ban-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}