import { useEffect, useState } from "react";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"];

export default function GenreCarousel({ onSelectMovie }) {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Загружаем фильмы при выборе жанра
  useEffect(() => {
    if (!selectedGenre) return;

    const loadMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/movies/load-by-genre?genre=${encodeURIComponent(
            selectedGenre
          )}&page=${page}`
        );
        const data = await res.json();
        if (page === 1) setMovies(data);
        else setMovies((prev) => [...prev, ...data]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedGenre, page]);

  const handleLoadMore = () => setPage((prev) => prev + 1);

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      {/* Список жанров слева */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          minWidth: 120,
        }}
      >
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => {
              setSelectedGenre(g);
              setPage(1); // сбросить страницу при смене жанра
              setMovies([]);
            }}
            style={{
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              background: selectedGenre === g ? "#41d3d2" : "#000",
              color: selectedGenre === g ? "#000" : "#8dd9ff",
              border: "1px solid #41d3d2",
              textAlign: "left",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Горизонтальная карусель */}
      <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: "1rem" }}>
        {selectedGenre ? (
          <>
            {movies.map((m) => (
              <div
                key={m.id}
                style={{
                  minWidth: 160,
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: "2px solid #ce3ed0",
                }}
                onClick={() => (onSelectMovie ? onSelectMovie(m.id) : window.location.href = `/details?id=${m.id}`)}
              >
                <img
                  src={m.poster || "/src/posternotfound.png"}
                  alt={m.title}
                  style={{
                    width: "100%",
                    height: 240,
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "0.5rem", textAlign: "center" }}>
                  <div>{m.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "#41d3d2" }}>
                    {m.year}
                  </div>
                </div>
              </div>
            ))}

            {/* Load more кнопка */}
            <div
              style={{
                minWidth: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleLoadMore}
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  background: "#41d3d2",
                  color: "#000",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ color: "#8dd9ff" }}>Select a genre to view movies</div>
        )}
      </div>
    </div>
  );
}
