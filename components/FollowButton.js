// components/FollowButton.js
import { useState, useEffect } from "react";

export default function FollowButton({ userId, currentUserId, followers, setFollowers }) {
  if (!currentUserId) return null;
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const isOwnProfile = currentUserId && userId && currentUserId.toString() === userId.toString();
  if (isOwnProfile) return null;

  useEffect(() => {
    if (!currentUserId || !userId) {
      setCheckingStatus(false);
      return;
    }
    
    async function checkFollowStatus() {
      try {
        const res = await fetch(`/api/users/${userId}/is-following`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingStatus(false);
      }
    }

    checkFollowStatus();
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
        credentials: "include",
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);

 if (setFollowers) {
        if (!isFollowing) {
         
          setFollowers(prev => [...prev, { ID: currentUserId, name: "You" }]);
        } else {
      
          setFollowers(prev => prev.filter(f => f.ID !== currentUserId));
        }
      }
    }
  } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return <button className="follow-btn loading" disabled>...</button>;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`follow-btn ${isFollowing ? "unfollow" : "follow"}`}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}



const styles = `
  .follow-btn {
    padding: 0.2rem 1rem;
    border: 1px solid;
    cursor: pointer;
    font-family: 'Basiic', sans-serif;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    border-radius: 0;
  }

  .follow-btn.follow {
    background: #595f52ff;
    color: #000;
    border-color: #595f52ff;
  }

  .follow-btn.follow:hover {
    background: #556b3bff;
    color: #61E0F4;
    border-color: #556b3bff;
  }

  .follow-btn.unfollow {
    background: #cab3ffff;
    color: #000;
  }

  .follow-btn.unfollow:hover {
    background: #908bd2ff;
    color: #61E0F4;
    border-color: #908bd2ff;
  }

  .follow-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}