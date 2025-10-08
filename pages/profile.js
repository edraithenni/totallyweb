import { useEffect, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import PlaylistCard from "../components/PlaylistCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bioEdit, setBioEdit] = useState(false);
  const [bioText, setBioText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/src/default_pfp.png");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const params = new URLSearchParams(window.location.search);
        let profileId = params.get("id");

        const resMe = await fetch("/api/users/me", { credentials: "include" });
        const me = await resMe.json();
        setCurrentUserId(me.id);

        if (!profileId) {
          profileId = me.id;
          window.history.replaceState(null, "", `/profile?id=${profileId}`);
        }
        setViewingProfileId(profileId);

        const res = await fetch(`/api/users/${profileId}`, { credentials: "include" });
        const data = await res.json();
        setUser(data);
        setBioText(data.description || "—");
        setAvatarUrl(data.avatar || "/src/default_pfp.png");

        loadPlaylists(profileId);
        loadReviews(profileId);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadPlaylists(userId) {
      const res = await fetch(`/api/users/${userId}/playlists`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.playlists || []);
      }
    }

    async function loadReviews(userId) {
      const res = await fetch(`/api/users/${userId}/reviews`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    }

    loadProfile();
  }, []);

  const isOwnProfile = currentUserId && viewingProfileId && currentUserId === viewingProfileId;

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

  return (
    <>
      <Header />
      <div className="profile-card">
        <div className="profile-header"></div>

        <div className="avatar-row">
          <img className="avatar" src={avatarUrl} alt="avatar" />
          <div className="name-and-email">
            <h1 className="name">{user?.name || "Loading..."}</h1>
            <div><b>Email:</b> {isOwnProfile ? user?.email || "—" : "—"}</div>
          </div>
        </div>

        <hr />
        <h3>Bio</h3>
        {!bioEdit && <div className="bio">{bioText}</div>}
        {bioEdit && (
          <div>
            <textarea
              style={{ width: "100%", fontSize: 20 }}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
            />
            <button onClick={handleBioSave} className="btn btn-save">Save</button>
            <button onClick={() => setBioEdit(false)} className="btn btn-cancel">Cancel</button>
          </div>
        )}
        {!bioEdit && isOwnProfile && (
          <button onClick={() => setBioEdit(true)} className="btn btn-edit">
            Edit
          </button>
        )}

        <hr />
        <h3>Playlists</h3>
        <div className="playlists-grid">
          {playlists.length === 0 && <p className="muted">No playlists yet</p>}
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              onClick={() => (window.location.href = `/playlist?id=${pl.id}`)}
            />
          ))}
        </div>

        <hr />
        <h3>Reviews</h3>
        <div>
          {reviews.length === 0 && <p className="muted">No reviews yet</p>}
          {reviews.map((rv) => (
            <ReviewCard
              key={rv.id}
              review={{
                user_id: rv.user_id,
                movie_title: rv.movie_title,
                rating: rv.rating,
                content: rv.content,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
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
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
        }

        .name {
          margin: 0;
          color: #ffffff;
          font-size: 1.8rem;
        }

        .bio {
          background: #000;
          padding: 10px;
          border: 1px solid #3a3a90;
          white-space: pre-wrap;
          color: #fff;
        }

        .muted {
          color: #5c5c5c;
          font-size: 1rem;
        }

        .btn {
          cursor: pointer;
          padding: 0.45rem 0.75rem;
          margin-right: 0.5rem;
          border-radius: 0;
          font-family: 'Basiic', sans-serif;
        }

        .btn-edit {
          background-color: #000;
          color: #fff;
          border: 1px solid #41d3d2;
        }

        .btn-save {
          background-color: #41d3d2;
          color: #000;
          border: 1px solid #41d3d2;
        }

        .btn-cancel {
          background-color: #ffb3ff;
          color: #000;
          border: 1px solid #ffb3ff;
        }

        .playlists-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
