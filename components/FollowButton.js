// components/FollowButton.js
import { useState, useEffect } from "react";

export default function FollowButton({ userId, currentUserId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Проверяем статус подписки при загрузке
  useEffect(() => {
    async function checkFollowStatus() {
      if (!currentUserId || !userId || currentUserId === userId) {
        setCheckingStatus(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/is-following`, {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.isFollowing);
        } else if (res.status === 401) {
          // Если не авторизован для проверки, оставляем состояние по умолчанию (false)
          // Фактический статус узнаем при попытке подписки
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
    if (loading || checkingStatus) return;
    
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: method,
        credentials: "include"
      });

      if (res.ok) {
        // Успешное изменение статуса подписки
        setIsFollowing(!isFollowing);
      } else if (res.status === 400) {
        // Обрабатываем случай "already following"
        const data = await res.json();
        if (data.error === "already following") {
          setIsFollowing(true); // Обновляем состояние - мы подписаны
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Не показываем кнопку если:
  // - это собственный профиль
  // - пользователь не авторизован
  // - ID не загружены
  if (!currentUserId || !userId || currentUserId === userId) {
    return null;
  }

  // Показываем загрузку пока проверяем статус
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