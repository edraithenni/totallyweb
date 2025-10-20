import { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import PlaylistCard from "../components/PlaylistCard";
import FollowButton from "../components/FollowButton";
import FollowList from "../components/FollowList";
import NotificationBell from "../components/NotificationBell";
import Link from "next/link"
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
  const [followers, setFollowers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

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
            setAvatarUrl(data.avatar || "/src/default_pfp.png");

            const resFollowers = await fetch(`/api/users/${profileId}/followers`, { credentials: "include" });
            if (resFollowers.ok) {
            const dataFollowers = await resFollowers.json();
  let list = dataFollowers.followers || dataFollowers.data || [];

  
  if (Array.isArray(list) && me?.id) {
    list = list.map(f => 
      f.ID === me.id ? { ...f, name: "You", isYou: true } : f
    );
  }

  setFollowers(list);
}
            await loadPlaylists(profileId);
            await loadReviews(profileId);
          } else {
            setPlaylists([]);
            setReviews([]);
          }
        }
      } catch (err) {
        console.error(err);
        setPlaylists([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadPlaylists(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/playlists`, { credentials: "include" });
        if (!res.ok) return setPlaylists([]);
        const data = await res.json().catch(() => null);
        if (!data) return setPlaylists([]);
        if (Array.isArray(data)) setPlaylists(data);
        else if (Array.isArray(data.playlists)) setPlaylists(data.playlists);
        else if (Array.isArray(data.data)) setPlaylists(data.data);
        else setPlaylists([]);
      } catch {
        setPlaylists([]);
      }
    }

    async function loadReviews(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/reviews`, { credentials: "include" });
        if (!res.ok) return setReviews([]);
        const data = await res.json().catch(() => null);
        if (!data) return setReviews([]);
        if (Array.isArray(data)) setReviews(data);
        else if (Array.isArray(data.reviews)) setReviews(data.reviews);
        else if (Array.isArray(data.data)) setReviews(data.data);
        else setReviews([]);
      } catch {
        setReviews([]);
      }
    }

    loadProfile();
  }, []);

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


  const isOwnProfile = currentUserId && viewingProfileId && currentUserId.toString() === viewingProfileId.toString();

  const onAvatarClick = () => {
    if (!isOwnProfile) return;
    setPreviewUrl(avatarUrl);
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadStatus("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return setUploadStatus("File is too big (max 5MB).");

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
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
      const newAvatar = data?.avatar || `/uploads/${viewingProfileId}/avatar.png?${Date.now()}`;
      setAvatarUrl(newAvatar);
      setPreviewUrl(newAvatar);
      setUser(prev => ({ ...prev, avatar: newAvatar }));
      setUploadStatus("Avatar updated.");
    } catch {
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
      const resp = await fetch("/api/users/me/avatar", { method: "DELETE", credentials: "include" });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const data = await resp.json();
      const newAvatar = data?.avatar || "/src/default_pfp.png";
      setAvatarUrl(newAvatar);
      setPreviewUrl(newAvatar);
      setUser(prev => ({ ...prev, avatar: newAvatar }));
      setModalOpen(false);
      setUploadStatus("Avatar deleted.");
    } catch {
      setUploadStatus("Error deleting avatar.");
    } finally {
      setTimeout(() => setUploadStatus(""), 2500);
    }
  };

  
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
    return <>
      <Header />
      <div className="loading">Loading...</div>
    </>;
  }

  return (
    <>
      <Header />
      <div className="profile-card">
        <div className="profile-header"></div>

       {isOwnProfile && ( 
            <div className="notif-container">
            <NotificationBell userId={currentUserId} />
            </div>
        )} 
       <FollowList
        userId={viewingProfileId}
        followers={followers}
        setFollowers={setFollowers}
        currentUserId={currentUserId}
        />


        <div className="avatar-row">
          <img
            className="avatar"
            src={avatarUrl}
            alt="avatar"
            onClick={onAvatarClick}
            style={{ cursor: isOwnProfile ? "pointer" : "default" }}
          />
          <div className="name-and-email">
            <div className="name-header">
              <h1 className="name">{user?.name || "Loading..."}</h1>
              {!isOwnProfile && (
                <FollowButton
                  userId={viewingProfileId}
                  currentUserId={currentUserId}
                  followers={followers}
                  setFollowers={setFollowers}
                />
              )}
            </div>
            {isOwnProfile ? <div className="email"><b>Email:</b> {user?.email || "—"}</div> : <div className="email muted">Private</div>}
          </div>
        </div>

        <div id="uploadStatus" className="upload-status">{uploadStatus}</div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

        <hr />
        <h3>Bio</h3>
<div
  ref={el => {
    if (bioEdit && el) {
      // ставим курсор в конец при начале редактирования
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }}
  className={`bio ${bioEdit ? "editing" : ""}`}
  contentEditable={bioEdit}
  suppressContentEditableWarning={true}
  onInput={(e) => {
    const text = e.currentTarget.textContent || "";
    if (text.length <= 200) {
      setBioText(text);
    } else {
      // ограничение по символам
      e.currentTarget.textContent = text.slice(0, 200);
      setBioText(text.slice(0, 200));
      // снова курсор в конец
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.currentTarget);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }}
>
  {bioText}
</div>

{isOwnProfile && (
  <>
    <button
      onClick={() => {
        if (bioEdit) handleBioSave();
        setBioEdit(!bioEdit);
      }}
      className="btn btn-edit"
    >
      {bioEdit ? "Save" : "Edit"}
    </button>

    {bioEdit && (
      <div className="char-count">{bioText.length}/200</div>
    )}
  </>
)}


       
        <hr />
        <h3>Playlists</h3>
        <div className="playlists-grid">
          {playlists.length === 0 ? <p className="muted">No playlists yet</p> : playlists.map(pl => <Link href={`/playlist?id=${pl.id}`}>
              <PlaylistCard key={pl.id} playlist={pl}/>
           </Link>)}
        </div>
        <hr />
        <h3>Reviews</h3>
        <div>
          {reviews.length === 0 ? <p className="muted">No reviews yet</p> : reviews.map(rv =>
             <ReviewCard key={rv.id} review={{ ...rv, user_avatar: avatarUrl, user_name: user?.name }} 
              currentUser={{ id: currentUserId }}
              showMovieLink={true}
              onReviewDeleted={() => setReviews(prev => prev.filter(r => r.id !== rv.id))}/>)}
        </div>

        <div id="avatarModal" className={`modal ${modalOpen ? "open" : ""}`}>
          <div className="modal-content">
            <div className="close-modal" onClick={() => setModalOpen(false)}>&times;</div>
            <img src={previewUrl} alt="Avatar preview" />
            {isOwnProfile && (
              <div className="avatar-options">
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-edit">Change pfp</button>
                <button onClick={handleDeleteAvatar} className="btn btn-cancel">Delete pfp</button>
              </div>
            )}
          </div>
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
      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }
        
        hr {
            border: none;
            height: 1px;
            background: linear-gradient(to right, #727d79, #727d79);
            width: calc(100% + 3rem); 
            margin: 2rem -1.5rem;
            border-radius: 2px;
        }

        .profile-card {
          position: relative;
          max-width: 700px;
          margin: 2rem auto;
         /* background-color: #0a1b31; */
         background-color: #262123ff;
          padding: 1.5rem;
          padding-top: 130px;
          border: 1px solid #727d79;
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
          border: 0px solid #fff;
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
  border: 1px solid transparent;
  color: #d2ece3;
  white-space: pre-wrap;
  min-height: 50px;
  transition: border 0.2s;
}

.bio.editing {
  border: 1px solid #d2ece3;
  outline: none;
  cursor: text;
}

.bio.editing:focus {
  border: 1px solid #d2ece3;
}

.char-count {
  font-size: 0.8rem;
  color: #727d79;
  text-align: right;
  margin-top: 4px;
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
          color: #727d79;
          border: 1px solid #727d79;
        }

        .btn-edit:hover {
          background: #292626ff;
          color: #d2ece3;
          border: 1px solid #727d79;
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
          background: #262123ff;
          padding: 1rem;
          border-radius: 0px;
          text-align: center;
        }
        .modal-content img {
          max-width: 90vw;
          max-height: 80vh;
          border-radius: 0px;
        }
        .close-modal {
            position: absolute;
            top: 1px;
            right: 1px;
            color: #d2ece3;
            cursor: pointer;
            font-size: 1.8rem;
            font-weight: bold;
            background: none;
            border: none;
            line-height: 1;
            transition: color 0.2s, transform 0.2s;
            z-index: 10; 
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