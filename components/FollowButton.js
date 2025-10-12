// components/FollowButton.js
import { useState, useEffect } from "react";

export default function FollowButton({ userId, currentUserId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // ОСНОВНОЕ ИСПРАВЛЕНИЕ: Добавляем проверку на одинаковые ID
  const isOwnProfile = currentUserId && userId && currentUserId.toString() === userId.toString();
  
  // Если это собственный профиль - сразу выходим
  if (isOwnProfile) {
    return null;
  }

  useEffect(() => {
    // Двойная проверка на случай race condition
    if (!currentUserId || !userId || currentUserId.toString() === userId.toString()) {
      setCheckingStatus(false);
      return;
    }
    
    async function checkFollowStatus() {
      try {
        const res = await fetch(`/api/users/${userId}/is-following`, {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.isFollowing);
        } else if (res.status === 401) {
          console.log("Not authorized to check follow status");
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setCheckingStatus(false);
      }
    }

    checkFollowStatus();
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    if (loading || checkingStatus || !currentUserId || !userId || currentUserId.toString() === userId.toString()) return;
    
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: method,
        credentials: "include"
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.error === "already following") {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ФИНАЛЬНАЯ ПРОВЕРКА: на всякий случай
  if (!currentUserId || !userId || currentUserId.toString() === userId.toString()) {
    return null;
  }

  if (checkingStatus) {
    return (
      <button className="follow-btn loading" disabled>
        ...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`follow-btn ${isFollowing ? "unfollow" : "follow"}`}
    >
      {loading ? "..." : (isFollowing ? "Unfollow" : "Follow")}
    </button>
  );
}

// Стили остаются без изменений
const styles = `
  .follow-btn {
    padding: 0.4rem 1rem;
    border: 1px solid;
    cursor: pointer;
    font-family: 'Basiic', sans-serif;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    border-radius: 0;
  }

  .follow-btn.follow {
    background: #41d3d2;
    color: #000;
    border-color: #41d3d2;
  }

  .follow-btn.follow:hover {
    background: #30c3c2;
    border-color: #30c3c2;
  }

  .follow-btn.unfollow {
    background: #ffb3ff;
    color: #000;
    border-color: #ffb3ff;
  }

  .follow-btn.unfollow:hover {
    background: #ff99ff;
    border-color: #ff99ff;
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