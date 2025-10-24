import { useState, useEffect } from "react";

export default function FollowButton({ userId, currentUserId, setFollowers }) {
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
      <style jsx>{`
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
          background: #aebbbaff !important;
          color: #000 !important;
          border-color: #aebbbaff !important;
        }

        .follow-btn.follow:hover {
          background: #687273ff !important;
          color: #61E0F4 !important;
          border-color: #687273ff !important;
        }

        .follow-btn.unfollow {
          background: #cab3ffff !important;
          color: #000 !important;
        }

        .follow-btn.unfollow:hover {
          background: #908bd2ff !important;
          color: #61E0F4 !important;
          border-color: #908bd2ff !important;
        }

        .follow-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}
