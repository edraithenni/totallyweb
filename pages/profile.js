import { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import PlaylistCard from "../components/PlaylistCard";
import FollowButton from "../components/FollowButton";
import FollowList from "../components/FollowList";


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bioEdit, setBioEdit] = useState(false);
  const [bioText, setBioText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/public/src/default_pfp.png");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const modalAvatarRef = useRef(null);

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

          const res = await fetch(`/api/users/${profileId}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            setBioText(data.description || "—");
            if (data.avatar && data.avatar !== "") setAvatarUrl(data.avatar);
            else setAvatarUrl(`/src/default_pfp.png`);
            await loadPlaylists(profileId);
            await loadReviews(profileId);
          } else {
            setPlaylists([]);
            setReviews([]);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setPlaylists([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
async function loadPlaylists(userId) {
  try {
    const res = await fetch(`/api/users/${userId}/playlists`, { credentials: "include" });
    if (!res.ok) {
      console.warn("loadPlaylists: bad status", res.status);
      setPlaylists([]);
      return;
    }

    const data = await res.json().catch((e) => {
      console.warn("loadPlaylists: invalid JSON", e);
      return null;
    });

    if (!data) {
      setPlaylists([]);
      return;
    }

    if (Array.isArray(data)) {
      setPlaylists(data);
    } else if (Array.isArray(data.playlists)) {
      setPlaylists(data.playlists);
    } else if (Array.isArray(data.data)) {
      setPlaylists(data.data);
    } else {
      console.warn("loadPlaylists: unexpected payload shape", data);
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
    if (!res.ok) {
      console.warn("loadReviews: bad status", res.status);
      setReviews([]);
      return;
    }

    const data = await res.json().catch((e) => {
      console.warn("loadReviews: invalid JSON", e);
      return null;
    });

    if (!data) {
      setReviews([]);
      return;
    }

    if (Array.isArray(data)) {
      setReviews(data);
    } else if (Array.isArray(data.reviews)) {
      setReviews(data.reviews);
    } else if (Array.isArray(data.data)) {
      setReviews(data.data);
    } else {
      console.warn("loadReviews: unexpected payload shape", data);
      setReviews([]);
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    setReviews([]);
  }
}


    loadProfile();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
  }, [modalOpen]);

  const isOwnProfile =
    currentUserId && viewingProfileId && currentUserId.toString() === viewingProfileId.toString();

  const onAvatarClick = () => {
    setPreviewUrl(avatarUrl);
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setUploadStatus("Please select an image file.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setUploadStatus("File is too big (max 5MB).");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setPreviewUrl(reader.result);
  };
  reader.readAsDataURL(file);

  setUploadStatus("Uploading...");
  const form = new FormData();
  form.append("avatar", file);

  try {
    const resp = await fetch("/api/users/me/avatar", {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!resp.ok) throw new Error("Server error " + resp.status);
    const data = await resp.json();
    
    const newAvatar = (data?.avatar && data.avatar !== "")
      ? data.avatar
      : `/uploads/${viewingProfileId}/avatar.png?${Date.now()}`;

    setAvatarUrl(newAvatar);
    setPreviewUrl(newAvatar);


    setUser(prev => ({ ...prev, avatar: newAvatar }));

    setUploadStatus("Avatar updated.");
  } catch (err) {
    console.error(err);
    setUploadStatus("Error uploading avatar.");
  } finally {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setUploadStatus(""), 3000);
  }
};

const handleDeleteAvatar = async () => {
  if (!confirm("Are you sure you want to delete avatar?")) return;
  setUploadStatus("Deleting...");
  try {
    const resp = await fetch("/api/users/me/avatar", {
      method: "DELETE",
      credentials: "include",
    });
    if (!resp.ok) throw new Error("Server error " + resp.status);
    const data = await resp.json();

    const newAvatar = (data?.avatar && data.avatar !== "")
        ? data.avatar
        : "/src/default_pfp.png";

    setAvatarUrl(newAvatar);
    setPreviewUrl(newAvatar);
    setUser(prev => ({ ...prev, avatar: newAvatar })); 

    setModalOpen(false);
    setUploadStatus("Avatar deleted.");
  } catch (err) {
    console.error(err);
    setUploadStatus("Error deleting avatar.");
  } finally {
    setTimeout(() => setUploadStatus(""), 2500);
  }
};



  useEffect(() => {
    let ws;
    async function initWS() {
      try {
        const meRes = await fetch("/api/users/me", { credentials: "include" });
        const me = await meRes.json();
        if (!me?.id) return;
        ws = new WebSocket(`ws://localhost:8080/ws?user_id=${me.id}`);
        ws.onmessage = (event) => {
          const notifList = document.getElementById("notifList");
          const notifCountSpan = document.getElementById("notifCount");
          if (notifList && notifCountSpan) {
            const li = document.createElement("li");
            li.textContent = event.data;
            notifList.prepend(li);
            notifCountSpan.textContent = Number(notifCountSpan.textContent || 0) + 1;
            notifCountSpan.style.display = "inline";
          }
        };
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
        <FollowList userId={viewingProfileId} />

        <div className="avatar-row">
          <img
            id="avatarImg"
            className="avatar"
            src={avatarUrl}
            alt="avatar"
            onClick={onAvatarClick}
            style={{ cursor: "pointer" }}
          />
          <div className="name-and-email">
            <div className="name-header">
              <h1 className="name">{user?.name || "Loading..."}</h1>
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

        <div id="uploadStatus" className="upload-status">{uploadStatus}</div>
        <input
          ref={fileInputRef}
          id="avatarInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

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
    reviews.map((rv) => {
      const reviewWithAvatar = { ...rv, user_avatar: avatarUrl, user_name: user?.name };
      return <ReviewCard key={rv.id} review={reviewWithAvatar} />;
    })
  )}
</div>

      </div>

      <div id="avatarModal" className={`modal ${modalOpen ? "open" : ""}`}>
        <div className="modal-content">
          <div className="close-modal" onClick={() => setModalOpen(false)}>&times;</div>
          <img id="modalAvatar" ref={modalAvatarRef} src={previewUrl} alt="Avatar preview" />
          <div className="avatar-options">
            {isOwnProfile && (
              <>
                <button id="changeAvatarBtn" onClick={() => fileInputRef.current?.click()} className="btn btn-edit">Change pfp</button>
                <button id="deleteAvatarBtn" onClick={handleDeleteAvatar} className="btn btn-cancel">Delete pfp</button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
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
          background: url('/src/tumblr_6720afe4b23fff20fb0a55a8733db945_b6f51cdd_400.webp') repeat center top;
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

        .modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal.open { display: flex; }
        .modal-content {
          position: relative;
          background: #0a1b31;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
        }
        .modal-content img {
          max-width: 90vw;
          max-height: 80vh;
          border-radius: 10px;
        }
        .close-modal {
          position: absolute;
          top: 10px;
          right: 20px;
          color: white;
          cursor: pointer;
          font-size: 2rem;
        }
        .avatar-options {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .upload-status {
          color: #41d3d2;
          font-size: 14px;
          margin-top: 8px;
        }
      `}</style>
    </>
  );
}