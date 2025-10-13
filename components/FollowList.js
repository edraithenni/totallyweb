import { useEffect, useState, useRef } from "react";

export default function FollowList({ userId, followers, setFollowers }) {

  const [tab, setTab] = useState("followers");
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      setLoading(true);
      try {
        const endpoint =
          tab === "followers"
            ? `/api/users/${userId}/followers`
            : `/api/users/${userId}/following`;
        const res = await fetch(endpoint, { credentials: "include" });
        const data = await res.json();

        const items =
          tab === "followers"
            ? data.followers || data.data || []
            : data.following || data.data || [];
        const validList = Array.isArray(items) ? items : [];
        setList(validList);
        setFilteredList(validList);
      } catch (err) {
        console.error("FollowList load error:", err);
        setList([]);
        setFilteredList([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, tab]);

  useEffect(() => {
  if (followers && Array.isArray(followers)) {
    setList(followers);
    setFilteredList(followers);
  }
}, [followers]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim().toLowerCase();
      const newList = list.filter((u) =>
        (u.name || "").toLowerCase().includes(query)
      );
      setFilteredList(newList);
    } else if (e.key === "Escape") {
      setSearchActive(false);
    }
  };

  const activateSearch = () => {
    setSearchActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="dos-followlist">
      <div className="dos-header">[ USER RELATIONS ]</div>

      <div className="dos-tabs">
        <button
          className={`dos-tab ${tab === "followers" ? "active" : ""}`}
          onClick={() => setTab("followers")}
        >
          FOLLOWERS
        </button>
        <button
          className={`dos-tab ${tab === "following" ? "active" : ""}`}
          onClick={() => setTab("following")}
        >
          FOLLOWING
        </button>
      </div>

      <div className="dos-body">
        {loading ? (
          <p className="dos-line">Loading...</p>
        ) : filteredList.length === 0 ? (
          <p className="dos-line">No {tab}</p>
        ) : (
          <ul>
            {filteredList.map((u) => (
              <li
                key={u.id}
                onClick={() => (window.location.href = `/profile?id=${u.ID}`)}
              >
                ▓ {u.name || `User #${u.ID}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dos-footer" onClick={activateSearch}>
        {searchActive ? (
          <>
            C:/SEARCH&gt;&nbsp;
            <input
              ref={inputRef}
              type="text"
              onKeyDown={handleSearch}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#00ff00",
                fontFamily: "'Basiic', monospace",
                width: "100%",
                caretColor: "#00ff00",
              }}
            />
          </>
        ) : (
          <span className="cursor">█</span>
        )}
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .dos-followlist {
          position: fixed;
          top: 160px;
          right: 28px;
          width: 230px;
          height: 420px;
          background: #000084;
          color: #FEFEFE;
          font-family: 'Basiic', monospace;
          border: 2px solid #BBBBBB;
          display: flex;
          flex-direction: column;
          z-index: 80;
          box-shadow: 2px 2px 0 #004000;
        }

        .dos-header {
          background: #000084;
          text-align: center;
          padding: 3px 0;
          border-bottom: 1px solid #00ff00;
          font-weight: bold;
        }

        .dos-tabs {
          display: flex;
          border-bottom: 1px solid #00ff00;
        }

        .dos-tab {
          flex: 1;
          background: #000084;
          color: #00ff00;
          border: none;
          border-right: 1px solid #00ff00;
          cursor: pointer;
          font-family: 'Basiic', monospace;
          padding: 3px 0;
        }

        .dos-tab:last-child {
          border-right: none;
        }

        .dos-tab.active {
          background: #004000;
          font-weight: bold;
        }

        .dos-tab:hover {
          background: #002000;
          color: #61E0F4;
        }

        .dos-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px;
          background: #000084;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        li {
          cursor: pointer;
          padding: 2px 4px;
          border-bottom: 1px dotted #004000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        li:hover {
          background: #082050;
          color: #61E0F4;
        }

        .dos-line {
          text-align: center;
          color: #00ff00;
          margin-top: 1rem;
        }

        .dos-footer {
          text-align: left;
          padding: 2px 4px;
          background: #001000;
          color: #00ff00;
          font-weight: bold;
          cursor: pointer;
        }

        .cursor {
          animation: blink 1s steps(2, start) infinite;
        }

        @keyframes blink {
          to {
            visibility: hidden;
          }
        }

        .dos-body::-webkit-scrollbar {
          width: 6px;
        }

        .dos-body::-webkit-scrollbar-thumb {
          background: #004000;
        }

        @media (max-width: 900px) {
          .dos-followlist {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
