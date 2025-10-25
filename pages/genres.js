import { useState } from "react";
import Head from "next/head";
import Header from "../components/header";

const GENRES = [
  "Action", "Adventure", "Animation", "Biography",
  "Crime", "Family", "Fantasy", "Film-Noir",
  "History", "Horror", "Mystery", "Romance", "Scifi",
  "Sports", "Thriller", "War"
];

const GENRE_ICONS = {
  Action: "/src/cd-drive-pastel.png",
  Adventure: "/src/cd-drive-pastel.png",
  Animation: "/src/cd-drive-pastel.png",
  Biography: "/src/cd-drive-pastel.png",
  Crime: "/src/cd-drive-pastel.png",
  Family: "/src/cd-drive-pastel.png",
  Fantasy: "/src/cd-drive-pastel.png",
  "Film-Noir": "/src/cd-drive-pastel.png",
  History: "/src/cd-drive-pastel.png",
  Horror: "/src/cd-drive-pastel.png",
  Mystery: "/src/cd-drive-pastel.png",
  Romance: "/src/cd-drive-pastel.png",
  Scifi: "/src/cd-drive-pastel.png",
  Sports: "/src/cd-drive-pastel.png",
  Thriller: "/src/cd-drive-pastel.png",
  War: "/src/cd-drive-pastel.png",
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

  return (
    <>
      <Head>
        <title>Browse by Genre</title>
      </Head>
      <Header />
      {selectedGenre === "Horror" && (
        <div className="horror-divider"></div>
      )}
      <div className={`page-container ${selectedGenre ? selectedGenre.toLowerCase() : ""}`}>
        {!selectedGenre ? (
          <div className="genres-list">
            {GENRES.map(g => (
             <div key={g} className="genre-item">
                <img src={GENRE_ICONS[g]} alt={`${g} icon`} className="genre-side-icon" />
                <button
                    className={`genre-btn ${selectedGenre === g ? "active" : ""}`}
                    onClick={() => {
                    setSelectedGenre(g);
                    loadMovies(g, 1);
                    }}
                >
                    {g}
                </button>
                </div>
            ))}
            </div>
        ) : (
          <div className="movies-container">
            
                <div className="genre-header">
                {selectedGenre === "Fantasy" ? (
                    <>
                     <img
                        src="src/tumblr_inline_ouovp1ujPdR1uqb749_500.png"
                        alt="Fantasy Icon"
                        className="genre-icon"
                    />
                     <h2>Fantasy Movies</h2>
                    </>
                ) : selectedGenre === "Horror" ? (
                  
                    <>
                      <img
                        src="src/madness_returns_4.png"
                        alt="Horror Icon"
                        className="genre-icon"
                      />
                      <h2>Horror Movies</h2>
                    </>
                ) : (
                    <h2>{selectedGenre} Movies</h2>
                )}
                </div>

            <div className="movies-nav">
              <button onClick={handlePrev} disabled={page === 1 || loading} className="nav-btn">&lt;-</button>

              <div className="movies-list">
                {movies.map(m => (
                  <div
                    key={m.id}
                    onClick={() => (window.location.href = `/details?id=${m.id}`)}
                    className="movie-card"
                  >
                    <img src={m.poster || "/src/posternotfound.png"} alt={m.title} className="movie-poster" />
                    <div className="movie-info">
                      <div>{m.title}</div>
                      <div className="movie-year">{m.year}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleNext} disabled={loading} className="nav-btn">-&gt;</button>
            </div>

            <button onClick={() => setSelectedGenre(null)} className="back-btn">
              Back to Genres
            </button>
            {selectedGenre === "Horror" && (
          <div className="horror-footer">
          <img
            src="src/web.archive.org---web---20061027181729---http_------www.geocities.com---toto125@sbcglobal.net---blinkie---SpookyEyes2.gif"
            alt="Horror footer"
            className="horror-footer-img"
            />
          </div>
          )}
          </div>
        )}
      </div>

      <style jsx>{`
        
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        @import url('https://fonts.cdnfonts.com/css/so-bad');
        @import url('https://fonts.cdnfonts.com/css/gothicpixels');
        @font-face {
            font-family: 'Jacquard_24';
            src: url('/src/Jacquard_24/Jacquard24-Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
        }

        .page-container {
           font-family: 'Basiic', sans-serif;
          background: #000;
          color: #8dd9ff;
          min-height: 100vh;
          text-align: center;
          padding-top: 2rem;
          transition: background 0.3s, color 0.3s;
        }

        .page-container.action {
          background: #0b0c10;
          color: #66fcf1;
        }

        .page-container.horror {
          background: #0f0000ff;
           font-family: 'Jacquard_24', system-ui;
          color: #ff1a1a;
        }
          .page-container.fantasy {
          background: #000000ff;
          color: #66fcf1;
          font-family: 'So Bad', sans-serif;
          
          background-image:linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/src/purplegalaxy.png"); 
            background-repeat: repeat;
            background-size: 128px 128px;
        }

        .page-container.fantasy .movie-card {
        background: rgba(0, 0, 0, 0.15);
        border: 1px solid #ce3ed0;
        color: #ffc659;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        transition: 0.3s;
        }
       

        .page-container.fantasy .movie-card:hover {
         transform: scale(1.08);
        box-shadow: 0 0 20px rgba(220, 180, 255, 0.6);
        background: rgba(200, 180, 255, 0.25);
        }

          .page-container.horror .movie-card {
        background: rgba(0, 0, 0, 0.15);
        border: 1px solid #84026eff;
        color: #ff1a1a;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        transition: 0.3s;
        font-family: 'Jacquard_24', system-ui;
        }

        .page-container.horror .movie-card:hover {
         transform: scale(1.08);
        box-shadow: 0 0 20px rgba(49, 59, 0, 0.6);
        background: rgba(0, 0, 48, 0.6);
        }

        .page-container.romance {
          background: #1a001a;
          color: #ffb3ff;
        }

        .genres-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          align-items: center;
        }

        .genre-btn {
          font-family: 'Basiic', sans-serif;
          padding: 0.4rem 0.8rem;
          
          background: #000;
          border: 1px solid #727d79;
          color: #727d79;
          cursor: pointer;
          font-size: 1.2rem;
          min-width: 250px;
          transition: 0.3s;
        }

        .genre-btn:hover {
          background: #1a1a1a;
          color: #d2ece3;
        }

        .genre-btn.active {
          background: #333;
          color: #fff;
        }

        .movies-container {
          margin-top: 2rem;
        }

        .movies-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .movies-list {
          display: flex;
          gap: 1rem;
          overflow: hidden;
        }

        .movie-card {
          font-family: 'So Bad', sans-serif;
          width: 180px;
          cursor: pointer;
          border: 2px solid #ce3ed0;
          background: #8dd9ff;
          color: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: 0.3s;
        }

        .movie-card:hover {
          transform: scale(1.05);
        }

        .movie-poster {
          width: 100%;
          height: 260px;
          object-fit: cover;
        }

        .movie-info {
          padding: 0.5rem;
          text-align: center;
        }

        .movie-year {
          font-size: 0.85rem;
          color: #333;
        }

        .nav-btn,
        .back-btn {
          background: none;
          border: 1px solid #727d79;
          color: #727d79;
          font-family: 'Basiic', sans-serif;
          padding: 0.3rem 1rem;
          cursor: pointer;
          transition: 0.3s;
        }

        .nav-btn:hover,
        .back-btn:hover {
          background: #060606ff;
          color: #d2ece3;
        }

        .back-btn {
          margin-top: 2rem;
        }

        .page-container.horror .nav-btn {
          border-color: #ff1a1a;
          color: #ff1a1a;
        }

        .page-container.romance .nav-btn {
          border-color: #ffb3ff;
          color: #ffb3ff;
        }

        .page-container.action .nav-btn {
          border-color: #45a29e;
          color: #66fcf1;
        }

        .genre-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            margin-bottom: 1rem;
            }

            .genre-header h2 {
            margin: 0;
            font-size: 1.8rem;
            }

            .genre-item {
                display: flex;
                align-items: center;
                gap: 0.6rem;          
            }

            .genre-side-icon {
                width: 30px;
                height: 30px;
                object-fit: contain;
                filter: brightness(0.85);
                transition: 0.3s;
                margin-top: 2px;      
                margin-right: 4px;   
                position: relative;
                top: 2px;            
            }
          .page-container.horror .genre-icon {
            width: 30px;   
          height: auto;
          margin-top: 2px;
          filter: brightness(0.85);
          }
          .page-container.fantasy .genre-icon {
            width: 55px;   
          height: auto;
          margin-top: 2px;
          filter: brightness(0.85);
          }

          
           .horror-divider {
          width: 100%;
          height: 50px; 
          background-image: url('/src/tumblr_a914d5e8b099742bc53740f3028fbc7f_de6272da_250.png'); 
          background-repeat: repeat-x; 
          background-size: auto 100%;
          
          margin-top: 20px;
          margin-bottom: 0rem;
          }


      `}</style>
    </>
  );
}
