import { useState } from "react";
import Head from "next/head";
import Header from "../components/header";

const GENRES = [
  "Action", "Adventure", "Animation", "Biography",
  "Crime", "Family", "Fantasy", "Film-Noir",
  "History", "Horror", "Mystery", "Romance", "Sci-Fi",
  "Sports", "Thriller", "War"
];

const GENRE_STYLES = {
  Action: { bg: "#000", color: "#8dd9ff", icon: "" },
  Adventure: { bg: "#000", color: "#8dd9ff", icon: "" },
  Animation: { bg: "#000", color: "#8dd9ff", icon: "" },
  Biography: { bg: "#000", color: "#8dd9ff", icon: "" },
  Crime: { bg: "#000", color: "#8dd9ff", icon: "" },
  Family: { bg: "#000", color: "#8dd9ff", icon: "" },
  Fantasy: { bg: "#000", color: "#8dd9ff", icon: "" },
  "Film-Noir": { bg: "#000", color: "#8dd9ff", icon: "" },
  History: { bg: "#000", color: "#8dd9ff", icon: "" },
  Horror: { bg: "#000", color: "#8dd9ff", icon: "" },
  Mystery: { bg: "#000", color: "#8dd9ff", icon: "" },
  Romance: { bg: "#000", color: "#8dd9ff", icon: "" },
  "Sci-Fi": { bg: "#000", color: "#8dd9ff", icon: "" },
  Sports: { bg: "#000", color: "#8dd9ff", icon: "" },
  Thriller: { bg: "#000", color: "#8dd9ff", icon: "" },
  War: { bg: "#000", color: "#8dd9ff", icon: "" },
};

export default function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMovies = async (genre, newPage = 1) => {
    if (!genre) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/load-by-genre?genre=${encodeURIComponent(genre)}&page=${newPage}`);
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
      setPage(newPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => loadMovies(selectedGenre, page + 1);
  const handlePrev = () => {
    if (page > 1) loadMovies(selectedGenre, page - 1);
  };

  const currentGenreStyle = selectedGenre ? GENRE_STYLES[selectedGenre] || {} : {};

  return (
    <>
      <Head>
        <title>Browse by Genre</title>
      </Head>
      <Header />
      
      <div
        style={{
          ...styles.container,
          background: currentGenreStyle.bg || styles.container.background,
          color: currentGenreStyle.color || styles.container.color,
        }}
      >
        {!selectedGenre ? (
          <div style={styles.genresList}>
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  loadMovies(g, 1);
                }}
                style={{
                  ...styles.genreButton,
                  background: selectedGenre === g ? "#333" : styles.genreButton.background,
                  color: selectedGenre === g ? "#fff" : styles.genreButton.color,
                }}
              >
                {g}
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.moviesContainer}>
            <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {currentGenreStyle.icon && (
                <img src={currentGenreStyle.icon} alt={selectedGenre} style={{ width: 32, height: 32 }} />
              )}
              {selectedGenre} Movies
            </h2>

            <div style={styles.moviesNav}>
              <button onClick={handlePrev} disabled={page === 1 || loading} style={styles.navButton}>◀</button>

              <div style={styles.moviesList}>
                {movies.map(m => (
                  <div
                    key={m.id}
                    onClick={() => window.location.href = `/details?id=${m.id}`}
                    style={styles.movieCard}
                  >
                    <img src={m.poster || "/src/posternotfound.png"} alt={m.title} style={styles.moviePoster} />
                    <div style={styles.movieInfo}>
                      <div>{m.title}</div>
                      <div style={styles.movieYear}>{m.year}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleNext} disabled={loading} style={styles.navButton}>▶</button>
            </div>

            <button
              onClick={() => setSelectedGenre(null)}
              style={styles.backButton}
            >
              Back to Genres
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }
      `}</style>
    </>
  );
}

const styles = {
  container: {
    fontFamily: '"Basiic", sans-serif',
    background: "#000",
    color: "#8dd9ff",
    minHeight: "100vh",
    textAlign: "center",
    paddingTop: "2rem",
  },
  genresList: {
    fontFamily: '"Basiic", sans-serif',
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    alignItems: "center",
  },
  genreButton: {
    fontFamily: '"Basiic", sans-serif',
    padding: "0.8rem 1.2rem",
    background: "#000",
    border: "2px solid #41d3d2",
    color: "#8dd9ff",
    cursor: "pointer",
    fontSize: "1.2rem",
    minWidth: 180,
  },
  moviesContainer: {
    marginTop: "2rem",
  },
  moviesNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1rem",
  },
  moviesList: {
    display: "flex",
    gap: "1rem",
    overflow: "hidden",
  },
  movieCard: {
    fontFamily: '"So Bad", sans-serif',
    width: 180,
    cursor: "pointer",
    border: "2px solid #ce3ed0",
    background: "#8dd9ff",
    color: "#000",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  moviePoster: {
    width: "100%",
    height: 260,
    objectFit: "cover",
  },
  movieInfo: {
    padding: ".5rem",
    textAlign: "center",
  },
  movieYear: {
    fontSize: ".85rem",
    color: "#333",
  },
  navButton: {
    fontFamily: '"So Bad", sans-serif',
    background: "none",
    border: "2px solid #41d3d2",
    color: "#8dd9ff",
    fontSize: "1.5rem",
    padding: ".5rem 1rem",
    cursor: "pointer",
  },
  backButton: {
    fontFamily: '"So Bad", sans-serif',
    marginTop: "2rem",
    background: "none",
    border: "2px solid #41d3d2",
    color: "#8dd9ff",
    padding: ".5rem 1rem",
    cursor: "pointer",
  },
};
