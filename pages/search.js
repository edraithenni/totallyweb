import Head from "next/head";
import { useState } from "react";
import Header from "../components/header";
import HudScene from "../components/HudScene"; 

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

  const showHud = !query.trim() && movies.length === 0 && !loading; 

  return (
    <>
      <Head>
        <link href="https://fonts.cdnfonts.com/css/so-bad" rel="stylesheet" />
        <title>Totally cats</title>
      </Head>

      {}
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
            placeholder="Enter movie title..."
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
            style={{ background: "#a9a9a9ff", color: "#8dd9ff", padding: ".6rem 1rem", fontFamily: "'Courier New', monospace",}}
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
              className="movie-card"
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
  <style jsx>{`
    
    .movie-card{
      background: #333333ff;
      color: #cd77ff;
      cursor: pointer;
      borderRadius: 0;
      outline: 2px solid #ce3ed0;
      transition: all ease 0.3s;
    }
    .movie-card:hover{
      transform: scale(1.05);
     }   
    `
  }
    </style>
    </>
    
  );


}