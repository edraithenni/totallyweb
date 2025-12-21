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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
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
    document.body.style.overflow = modalOpen || settingsOpen || deleteModalOpen ? "hidden" : "auto";
  }, [modalOpen, settingsOpen, deleteModalOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setSettingsOpen(false);
        setDeleteModalOpen(false);
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
      
      const newAvatarPath = data?.avatar || `/uploads/avatars/user_${viewingProfileId}.png`;
      const finalAvatarUrl = `${newAvatarPath}?t=${Date.now()}`;
      
      setAvatarUrl(finalAvatarUrl);
      setPreviewUrl(finalAvatarUrl);
      setUser(prev => ({ ...prev, avatar: finalAvatarUrl }));
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    if (!confirm("Are you absolutely sure? This will permanently delete your account, playlists, reviews, and all data. This action cannot be undone!")) {
      return;
    }

    setDeleting(true);
    try {
      const resp = await fetch("/api/users/me", {
        method: "DELETE",
        credentials: "include"
      });

      if (resp.ok) {
        toast.success("Account deleted successfully");
        setTimeout(() => {
          window.location.href = "/search";
        }, 1500);
      } else {
        const error = await resp.text();
        toast.error(`Failed to delete account: ${error}`);
        setDeleting(false);
      }
    } catch (err) {
      toast.error("Error deleting account");
      console.error(err);
      setDeleting(false);
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
              {isOwnProfile && (
                <button 
                  className="btn btn-settings"
                  onClick={() => setSettingsOpen(true)}
                  title="Settings"
                
                >
                  ⚙
                </button>
              )}
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
              e.currentTarget.textContent = text.slice(0, 200);
              setBioText(text.slice(0, 200));
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

        <div id="settingsModal" className={`modal ${settingsOpen ? "open" : ""}`}>
          <div className="modal-content settings-content">
            <div className="close-modal" onClick={() => setSettingsOpen(false)}>&times;</div>
            
            <h2>Settings</h2>
            
            <div className="settings-section">             
              <div className="settings-actions">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="btn btn-delete-settings"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

      
          <div className="modal-content delete-content">
            <div className="close-modal" onClick={() => {
              setDeleteModalOpen(false);
              setDeleteConfirm("");
            }}>&times;</div>
            
            <h2>Delete Account</h2>
            
            <div className="danger-zone">
              <p className="warning-text">
                ⚠️ Deleting your account is permanent. All your playlists, reviews, comments, and data will be removed.
              </p>
              
              <div className="delete-confirm">
                <p>Type <strong>DELETE</strong> to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE here"
                  className="delete-input"
                  disabled={deleting}
                />
              </div>
              
              <div className="delete-actions">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className={`btn ${deleteConfirm === "DELETE" ? "btn-delete" : "btn-delete-disabled"}`}
                >
                  {deleting ? "Deleting..." : "Delete Account Permanently"}
                </button>
                
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirm("");
                  }}
                  className="btn btn-cancel"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
       <div id="deleteModal" className={`modal ${deleteModalOpen ? "open" : ""}`}>
  <div className="modal-content delete-content">
    <div className="close-modal" onClick={() => {
      setDeleteModalOpen(false);
      setDeleteConfirm("");
    }}>&times;</div>
    
    <h2>Delete Account</h2>
    
    <div className="danger-zone">
      <p className="warning-text">
        ⚠️ Deleting your account is permanent. All your playlists, reviews, comments, and data will be removed.
      </p>
      
      <div className="delete-confirm">
        <p>Type <strong>DELETE</strong> to confirm:</p>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder="Type DELETE here"
          className="delete-input"
          disabled={deleting}
        />
      </div>
      
      <div className="delete-actions" style={{display: "flex", gap: "1rem", justifyContent: "center"}}>
        <button
          onClick={handleDeleteAccount}
          disabled={deleteConfirm !== "DELETE" || deleting}
          className={`btn ${deleteConfirm === "DELETE" ? "btn-delete" : "btn-delete-disabled"}`}
        >
          {deleting ? "Deleting..." : "Delete Account"}
        </button>
        
        <button
          onClick={() => {
            setDeleteModalOpen(false);
            setDeleteConfirm("");
          }}
          className="btn btn-cancel"
          disabled={deleting}
        >
          Cancel
        </button>
      </div>
    </div>
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
          overflow: hidden;
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 0px solid #fff;
          background: #000;
           max-width: 100%;

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

        .btn-settings {
          background: #000;
          color: #727d79;
          border: 1px solid #727d79;
          font-size: 1.2rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
           position: absolute;
          top: 10px;
          right: 0px;
          z-index: 5;
        }

        .btn-settings:hover {
          background: #292626ff;
          color: #d2ece3;
          border: 1px solid #727d79;
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

        .btn-cancel {
          background: #ffb3ff;
          color: #000;
          border: 1px solid #ffb3ff;
        }

        .btn-cancel:hover {
          background: #ff99ff;
          color: #000;
          border: 1px solid #ff99ff;
        }

        .btn-delete {
          background: #ff4444;
          color: #fff;
          border: 1px solid #ff4444;
        }

        .btn-delete:hover {
          background: #ff2222;
          color: #fff;
          border: 1px solid #ff2222;
        }

        .btn-delete-disabled {
          background: #444;
          color: #888;
          border: 1px solid #444;
          cursor: not-allowed;
        }

        .btn-delete-disabled:hover {
          background: #444;
          color: #888;
          border: 1px solid #444;
        }

        .btn-delete-settings {
          background: #000;
          color: #ff4444;
          border: 1px solid #ff4444;
          width: 100%;
          margin-top: 1rem;
        }

        .btn-delete-settings:hover {
          background: #ff4444;
          color: #000;
          border: 1px solid #ff4444;
        }

        .modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
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
          max-width: 600px;
          width: 90%;
          border: 1px solid #727d79;
           max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box; 
  overflow-x: hidden; 
  word-wrap: break-word; 
  margin: 0 auto; 
        }
        
        .modal-content img {
  max-width: calc(100% - 2rem); 
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 0px;
  display: block;
  margin: 0 auto; 

  position: relative;
  left: 0;
  right: 0;
  object-position: center;
}
        
        .close-modal {
          position: absolute;
          top: 10px;
          right: 15px;
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
        
        .close-modal:hover {
          color: #fff;
          transform: scale(1.1);
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

        .settings-content {
          max-width: 500px;
          text-align: left;
        }

        .settings-content h2 {
          color: #fff;
          margin-top: 0;
          margin-bottom: 1.5rem;
          text-align: center;
          border-bottom: 1px solid #727d79;
          padding-bottom: 0.5rem;
        }

        .settings-content h3 {
          color: #ff4444;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .settings-section {
          margin-bottom: 2rem;
        }

        .warning-text {
          color: #d2ece3;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .settings-actions {
          margin-top: 1.5rem;
        }

        .delete-content {
          max-width: 500px;
        }

        .delete-content h2 {
          color: #ff4444;
          margin-top: 0;
          margin-bottom: 1.5rem;
          text-align: center;
          border-bottom: 1px solid #727d79;
          padding-bottom: 0.5rem;
        }

       

        .delete-confirm {
          margin: 1.5rem 0;
        }

        .delete-confirm p {
          color: #d2ece3;
          margin-bottom: 0.5rem;
        }

        .delete-input {
          background: #000;
          border: 1px solid #727d79;
          color: #d2ece3;
          padding: 0.5rem;
          width: 100%;
          font-family: 'Basiic', sans-serif;
          font-size: 1rem;
        }

        .delete-input:focus {
          outline: none;
          border: 1px solid #41d3d2;
        }

        .delete-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .delete-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .muted {
          color: #727d79;
          font-style: italic;
        }
      `}</style>
    </>
  );
}