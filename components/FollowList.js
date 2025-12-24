import { useEffect, useState, useRef } from "react";
import { useTranslation } from "next-i18next";

export default function FollowList({ userId, followers }) {
  const { t } = useTranslation("components");
  const [tab, setTab] = useState("followers");
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const inputRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    async function loadCurrentUser() {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (res.ok) {
        const me = await res.json();
        setCurrentUserId(me.id);
      }
    }
    loadCurrentUser();
  }, []);

  function normalizeItems(items, meId) {
    return (items || []).map((u) => {
      if (u.ID === meId)
        return { ...u, name: t("followList.you", "You"), isYou: true };
      return { ...u, isYou: false };
    });
  }

  function getUserDisplayName(user) {
    if (user.isYou) return user.name;
    return user.name || t("followList.user", "User #{{id}}", { id: user.ID });
  }

  useEffect(() => {
    if (!Array.isArray(followers)) return;
    const normalized = normalizeItems(followers, currentUserId);
    setList(normalized);
    setFilteredList(normalized);
  }, [followers, currentUserId]);

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
        const normalized = normalizeItems(validList, currentUserId);
        setList(normalized);
        setFilteredList(normalized);
      } catch (err) {
        console.error("FollowList load error:", err);
        setList([]);
        setFilteredList([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, tab, currentUserId]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim().toLowerCase();
      const newList = list.filter((u) =>
        getUserDisplayName(u).toLowerCase().includes(query)
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
      <div className="dos-header">
        [{t("followList.title", "USER RELATIONS")}]
      </div>

      <div className="dos-tabs">
        <button
          className={`dos-tab ${tab === "followers" ? "active" : ""}`}
          onClick={() => setTab("followers")}
        >
          {t("followList.followers", "FOLLOWERS")}
        </button>
        <button
          className={`dos-tab ${tab === "following" ? "active" : ""}`}
          onClick={() => setTab("following")}
        >
          {t("followList.following", "FOLLOWING")}
        </button>
      </div>

      <div className="dos-body">
        {loading ? (
          <p className="dos-line">
            {t("followList.loading", "Loading...")}
          </p>
        ) : filteredList.length === 0 ? (
          <p className="dos-line">
            {t("followList.empty", "No {{tab}}", {
              tab: tab === "followers"
                ? t("followList.followers", "FOLLOWERS")
                : t("followList.following", "FOLLOWING"),
            })}
          </p>
        ) : (
          <ul>
            {filteredList.map((u) => (
              <li
                key={u.ID}
                onClick={() => (window.location.href = `/profile?id=${u.ID}`)}
                className={u.isYou ? "you-item" : ""}
              >
                ▓ {getUserDisplayName(u)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dos-footer" onClick={activateSearch}>
        {searchActive ? (
          <>
            {t("followList.searchPrompt", "C:/SEARCH&gt; ")}
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
          font-family: "Basiic";
          src: url("/src/basiic.ttf") format("truetype");
        }

        .dos-followlist {
          position: fixed;
          top: 160px;
          right: 2%;
          width: 230px;
          height: 420px;
          background: #000084;
          color: #fefefe;
          font-family: "Basiic", monospace;
          border: 2px solid #bbbbbb;
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
          font-family: "Basiic", monospace;
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
          color: #61e0f4;
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
          color: #61e0f4;
        }

        .you-item {
          color: #ff66cc;
          background: #30001f;
          font-weight: bold;
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