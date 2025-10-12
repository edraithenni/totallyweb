import { useEffect, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import PlaylistCard from "../components/PlaylistCard";
import FollowButton from "../components/FollowButton"; 

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bioEdit, setBioEdit] = useState(false);
  const [bioText, setBioText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/src/default_pfp.png");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        let profileId = params.get("id");

        const resMe = await fetch("/api/users/me", { credentials: "include" });
        if (resMe.ok) {
          const me = await resMe.json();
          setCurrentUserId(me.id);

          if (!profileId) {
            profileId = me.id;
            window.history.replaceState(null, "", `/profile?id=${profileId}`);
          }
          setViewingProfileId(profileId);

          // ИСПРАВЛЕНИЕ: Ждем пока установится currentUserId перед загрузкой профиля
          const res = await fetch(`/api/users/${profileId}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            setBioText(data.description || "—");
            setAvatarUrl(data.avatar || "/src/default_pfp.png");

            await loadPlaylists(profileId);
            await loadReviews(profileId);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadPlaylists(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/playlists`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!data) {
            setPlaylists([]);
            return;
          }
          if (Array.isArray(data)) setPlaylists(data);
          else if (data.playlists) setPlaylists(data.playlists);
          else if (data.data) setPlaylists(data.data);
          else setPlaylists([]);
        } else {
          setPlaylists([]);
        }
      } catch (error) {
        console.error("Error loading playlists:", error);
        setPlaylists([]);
      }
    }

    async function loadReviews(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/reviews`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!data) {
            setReviews([]);
            return;
          }
          if (Array.isArray(data)) setReviews(data);
          else if (data.reviews) setReviews(data.reviews);
          else if (data.data) setReviews(data.data);
          else setReviews([]);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    }

    loadProfile();
  }, []);

  // ИСПРАВЛЕНИЕ: Добавляем toString() для надежного сравнения
  const isOwnProfile = currentUserId && viewingProfileId && 
                      currentUserId.toString() === viewingProfileId.toString();

  useEffect(() => {
    const notifBtn = document.getElementById("notifBtn");
    const notifMenu = document.getElementById("notifMenu");
    const notifList = document.getElementById("notifList");
    const notifCountSpan = document.getElementById("notifCount");
    let notifCount = 0;

    function addNotification(msg) {
      const li = document.createElement("li");
      li.textContent = msg;
      notifList.prepend(li);
      notifCount++;
      notifCountSpan.textContent = notifCount;
      notifCountSpan.style.display = "inline";
    }

    if (notifBtn && notifMenu) {
      notifBtn.addEventListener("click", () => {
        notifMenu.style.display = notifMenu.style.display === "block" ? "none" : "block";
        if (notifMenu.style.display === "block") {
          notifCount = 0;
          notifCountSpan.style.display = "none";
        }
      });
    }

    let ws;
    async function initWS() {
      try {
        const meRes = await fetch("/api/users/me", { credentials: "include" });
        const me = await meRes.json();
        if (!me?.id) return;
        ws = new WebSocket(`ws://localhost:8080/ws?user_id=${me.id}`);
        ws.onmessage = (event) => addNotification(event.data);
        ws.onclose = () => setTimeout(initWS, 2000);
      } catch (err) {
        console.error("WebSocket error:", err);
      }
    }
    initWS();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleBioSave = async () => {
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: bioText }),
      });
      if (res.ok) setBioEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-card">
        <div className="profile-header"></div>

        <div className="notif-container">
          <button id="notifBtn" className="notif-btn">
            <img src="/src/mail-pink.png" alt="Notifications" />
            <span id="notifCount" className="notif-count">0</span>
          </button>
          <div id="notifMenu" className="notif-menu">
            <p>Notifications</p>
            <ul id="notifList"></ul>
          </div>
        </div>

        <div className="avatar-row">
          <img className="avatar" src={avatarUrl} alt="avatar" />
          <div className="name-and-email">
            <div className="name-header">
              <h1 className="name">{user?.name || "Loading..."}</h1>

              {/* ИСПРАВЛЕНИЕ: Добавляем ключ для принудительного пересоздания компонента */}
              <FollowButton 
                key={`follow-${viewingProfileId}-${currentUserId}`}
                userId={viewingProfileId} 
                currentUserId={currentUserId} 
              />
            </div>

            {isOwnProfile ? (
              <div className="email">
                <b>Email:</b> {user?.email || "—"}
              </div>
            ) : (
              <div className="email muted">Private</div>
            )}
          </div>
        </div>

        <hr />
        <h3>Bio</h3>
        {!bioEdit && <div className="bio">{bioText}</div>}
        {bioEdit && (
          <div className="bio-edit">
            <textarea
              style={{ width: "100%", fontSize: 18 }}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
            />
            <div className="bio-buttons">
              <button onClick={handleBioSave} className="btn btn-save">Save</button>
              <button onClick={() => setBioEdit(false)} className="btn btn-cancel">Cancel</button>
            </div>
          </div>
        )}

        {!bioEdit && isOwnProfile && (
          <button onClick={() => setBioEdit(true)} className="btn btn-edit">Edit</button>
        )}

        <hr />
        <h3>Playlists</h3>
        <div className="playlists-grid">
          {(!playlists || playlists.length === 0) ? (
            <p className="muted">No playlists yet</p>
          ) : (
            playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onClick={() => (window.location.href = `/playlist?id=${pl.id}`)}
              />
            ))
          )}
        </div>

        <hr />
        <h3>Reviews</h3>
        <div>
          {(!reviews || reviews.length === 0) ? (
            <p className="muted">No reviews yet</p>
          ) : (
            reviews.map((rv) => (
              <ReviewCard
                key={rv.id}
                review={{
                  id: rv.id,
                  user_id: rv.user_id,
                  movie_title: rv.movie_title,
                  rating: rv.rating,
                  content: rv.content,
                  created_at: rv.created_at,
                  user_name: user?.name, 
                 ...rv
                }}
              />
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        /* Стили остаются без изменений */
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .profile-card {
          position: relative;
          max-width: 700px;
          margin: 2rem auto;
          background-color: #0a1b31;
          padding: 1.5rem;
          padding-top: 130px;
          border: 2px solid #3f3d40;
          color: #9c9cc9;
          font-family: 'Basiic', sans-serif;
        }

        .profile-header {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 120px;
          background: url('/src/tumblr_6720afe4b23fff20fb0a55a8733db945_b6f51cdd_400.webp')
            repeat center top;
          background-size: auto;
          z-index: 0;
        }

        .notif-container {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
        }
        .notif-btn {
          position: relative;
          background: #000;
          border: 1px solid #41d3d2;
          padding: 4px;
        }
        .notif-btn img {
          width: 35px;
          height: 35px;
        }
        .notif-count {
          display: none;
          position: absolute;
          top: -5px;
          right: -5px;
          background: red;
          color: white;
          padding: 0 6px;
          font-size: 0.75rem;
        }
        .notif-menu {
          display: none;
          position: absolute;
          right: 0;
          top: 2.5rem;
          background: #24203e;
          color: #fff;
          border: 1px solid #3a3a90;
          min-width: 250px;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,.3);
          font-family: 'Basiic', sans-serif;
        }
        .notif-menu p {
          padding: 0.5rem;
          margin: 0;
          border-bottom: 1px solid #3a3a90;
        }
        .notif-menu ul {
          list-style: none;
          margin: 0;
          padding: 0.5rem;
        }

        .avatar-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          background: #000;
        }

        .name-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .name {
          margin: 0;
          color: #fff;
          font-size: 1.8rem;
        }

        .email {
          color: #9c9cc9;
          margin-top: 4px;
        }

        .bio {
          background: #000;
          padding: 10px;
          border: 1px solid #3a3a90;
          white-space: pre-wrap;
          color: #fff;
        }

        .bio-edit {
          margin-top: 0.5rem;
        }
        .bio-buttons {
          margin-top: 0.5rem;
        }

        .playlists-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn {
          cursor: pointer;
          padding: 0.45rem 0.75rem;
          margin-right: 0.5rem;
          border-radius: 0;
          font-family: 'Basiic', sans-serif;
        }

        .btn-edit {
          background: #000;
          color: #fff;
          border: 1px solid #41d3d2;
        }

        .btn-save {
          background: #41d3d2;
          color: #000;
          border: 1px solid #41d3d2;
        }

        .btn-cancel {
          background: #ffb3ff;
          color: #000;
          border: 1px solid #ffb3ff;
        }
      `}</style>
    </>
  );
}