import Head from "next/head";
import { useState } from "react";
import Header from "../components/header";
import HudScene from "../components/HudScene";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function SearchPage() {
  const { t, ready } = useTranslation(['search', 'common', 'components']);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  
  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#000",
        color: "#8dd9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p>{t('common:loading', { defaultValue: "Loading..." })}</p>
      </div>
    );
  }

  async function searchMovies() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/search?title=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMovies(data.Search || []);
    } catch {
      alert(t('pages.movies.searchError', { ns: 'search' }) || "Search error");
    } finally {
      setLoading(false);
    }
  }

  const showHud = !query.trim() && movies.length === 0 && !loading;

  return (
    <>
      <Head>
        <link href="https://fonts.cdnfonts.com/css/so-bad" rel="stylesheet" />
        <title>{t('pages.movies.title', { ns: 'search' })}</title>
      </Head>

      {showHud && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <HudScene />
        </div>
      )}

      <div
        style={{
          fontFamily: '"So Bad", sans-serif',
          background: "transparent",
          color: "#8dd9ff",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Header />

        <div style={{ maxWidth: 600, margin: "2rem auto", display: "flex", gap: ".5rem" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMovies()}
            placeholder={t('pages.movies.searchPlaceholder', { ns: 'search' })}
            style={{
              flex: 1,
              padding: ".6rem 1rem",
              border: "1px solid #ccc",
              backgroundColor: "#333333ff",
              color: "#8dd9ff",
              fontFamily: "'Courier New', monospace",
              fontStyle: "italic",
            }}
          />
          <button
            onClick={searchMovies}
            disabled={loading}
            style={{
              background: "#a9a9a9ff",
              color: "#8dd9ff",
              padding: ".6rem 1rem",
              fontFamily: "'Courier New', monospace",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? t('pages.movies.loading', { ns: 'search' }) : t('pages.movies.searchButton', { ns: 'search' })}
          </button>
        </div>

        {movies.length === 0 && query.trim() && !loading && (
          <div style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#ce3ed0",
            fontSize: "1.2rem"
          }}>
            {t('pages.movies.noResults', { ns: 'search' })}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "1rem",
          }}
        >
          {movies.map((m) => (
            <div
              key={m.id}
              className="movie-card"
              onClick={() => (window.location.href = `/details?id=${m.id}`)}
            >
              <img
                src={m.poster || "/src/posternotfound.png"}
                alt={m.title || "Movie poster"}
                style={{ width: "100%", height: 300, objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/src/posternotfound.png";
                }}
              />
              <div style={{ padding: ".8rem" }}>
                <div style={{
                  fontSize: "1.1rem",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#cd77ff"
                }}>
                  {m.title}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#8dd9ff" }}>
                  <span style={{ color: "#ce3ed0" }}>
                    {t('movieCard:year', { ns: 'search' })}:
                  </span> {m.year}
                </div>
                <div style={{
                  fontSize: "0.8rem",
                  color: "#ce3ed0",
                  marginTop: "0.5rem",
                  textDecoration: "underline"
                }}>
                  {t('movieCard:viewDetails', { ns: 'search' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .movie-card {
          background: #333333ff;
          color: #cd77ff;
          cursor: pointer;
          border-radius: 0;
          outline: 2px solid #ce3ed0;
          transition: all ease 0.3s;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .movie-card:hover {
          transform: scale(1.05);
          outline-color: #8dd9ff;
          box-shadow: 0 0 15px rgba(141, 217, 255, 0.5);
        }
        
        .movie-card img {
          transition: transform 0.3s ease;
        }
        
        .movie-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
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