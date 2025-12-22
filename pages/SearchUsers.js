import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "../components/header";
import HudScene from "../components/HudScene2";
import UserCard from "../components/UserCard";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function SearchUsersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { t } = useTranslation(['search', 'common', 'components']);
  
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    }
    fetchCurrentUser();
  }, []);

  async function searchUsers() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      alert("Search error");
    } finally {
      setLoading(false);
    }
  }

  const showHud = !searched;

  return (
    <>
      <Head>
        <title>User Search — Totally Guys</title>
      </Head>

      {showHud && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1, opacity: 0.6 }}>
          <HudScene />
        </div>
      )}

      <div
        style={{
          fontFamily: '"MS Gothic", "Courier New", monospace',
          color: "#9EB897",
          minHeight: "100vh",
          position: "relative",
          zIndex: 2,
          paddingBottom: "2rem",
          background: "transparent",
        }}
      >
        <Header />

        <div
          style={{
            maxWidth: 600,
            margin: "2rem auto",
            display: "flex",
            gap: ".5rem",
            background: "rgba(5, 5, 5, 0.65)",
            border: "1px solid #112211",
            padding: "0.8rem",
            borderRadius: "0px",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            placeholder={t('pages.movies.searchPlaceholder', { ns: 'search' })}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              border: "1px solid #112211",
              backgroundColor: "#070707",
              color: "#9EB897",
              fontFamily: '"MS Gothic", "Courier New", monospace',
              fontSize: "13px",
              borderRadius: "0px",
            }}
          />
          <button
            onClick={searchUsers}
            style={{
              backgroundColor: "#0A100A",
              border: "1px solid #112211",
              color: "#9EB897",
              padding: "0.6rem 1rem",
              fontFamily: '"MS Gothic", "Courier New", monospace',
              fontSize: "13px",
              cursor: "pointer",
              borderRadius: "0px",
            }}
          >
            {loading ? "searching..." : "search"}
          </button>
        </div>

        {searched && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              maxWidth: 700,
              margin: "0 auto",
              padding: "1rem",
              border: "1px solid #112211",
              borderRadius: "0px",
              backgroundColor: "rgba(5, 5, 5, 0.7)",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.6)",
            }}
          >
            {users.length > 0 ? (
              users.map((u) => (
                <UserCard
                  key={u.ID}
                  user={u}
                  currentUserId={currentUser?.id}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#698969",
                  opacity: 0.8,
                  padding: "1rem 0",
                }}
              >
                no users found
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['search', 'common', 'components'])),
    },
  }
}