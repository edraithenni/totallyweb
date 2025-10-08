import Head from "next/head";
import { useState } from "react";
import Header from "../components/header";
import HudScene from "../components/HudScene"; // 👈 3D-сцена

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchMovies() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/search?title=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMovies(data.Search || []);
    } catch {
      alert("Search error");
    } finally {
      setLoading(false);
    }
  }

  const showHud = !query.trim() && movies.length === 0 && !loading; // 👈 логика показа 3D-сцены

  return (
    <>
      <Head>
        <link href="https://fonts.cdnfonts.com/css/so-bad" rel="stylesheet" />
        <title>Totally cats</title>
      </Head>

      {/* 👇 показываем только если нет поиска и фильмов */}
      {showHud && <HudScene />}

      <div
        style={{
          fontFamily: '"So Bad", sans-serif',
          background: "transparent", // 3D видно за контентом
          color: "#8dd9ff",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1, // контент поверх 3D
        }}
      >
        <Header />

        <div style={{ maxWidth: 600, margin: "2rem auto", display: "flex", gap: ".5rem" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMovies()}
            placeholder="Enter movie title..."
            style={{
              flex: 1,
              padding: ".6rem 1rem",
              border: "1px solid #ccc",
              backgroundColor: "#cd77ff",
              color: "#8dd9ff",
            }}
          />
          <button
            onClick={searchMovies}
            style={{ background: "#584fdb", color: "#8dd9ff", padding: ".6rem 1rem" }}
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

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
              style={{
                background: "#8dd9ff",
                color: "#cd77ff",
                cursor: "pointer",
                borderRadius: 0,
                outline: "2px solid #ce3ed0",
              }}
              onClick={() => (window.location.href = `/details?id=${m.id}`)}
            >
              <img
                src={m.poster || "/src/posternotfound.png"}
                alt="poster"
                style={{ width: "100%", height: 300, objectFit: "cover" }}
              />
              <div style={{ padding: ".8rem" }}>
                <div>{m.title}</div>
                <div>{m.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
