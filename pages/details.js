import { useEffect, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";

export default function DetailsPage() {
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState("");

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const movieId = params?.get("id");

  useEffect(() => {
    if (!movieId) return;
    fetch(`/api/movies/${movieId}`)
      .then(res => res.json())
      .then(setMovie)
      .catch(() => setMovie(null));

    loadReviews();
  }, [movieId]);

  async function loadReviews() {
    if (!movieId) return;
    try {
      const res = await fetch(`/api/movies/${movieId}/reviews`);
      if (res.ok) setReviews(await res.json());
    } catch {}
  }

  async function submitReview() {
    if (!reviewRating || reviewRating < 1 || reviewRating > 10) {
      alert("Rating must be between 1 and 10");
      return;
    }
    try {
      const res = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: reviewContent, rating: parseInt(reviewRating) })
      });
      if (res.ok) {
        setReviewContent("");
        setReviewRating("");
        loadReviews();
      } else {
        alert("Failed to submit review");
      }
    } catch (err) { alert("Error submitting review"); }
  }

  if (!movie) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="movie-container">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
        </div>
        <div className="movie-info">
          <h2>{movie.title}</h2>
          <p><b>Year:</b> {movie.year || "—"}</p>
          <p><b>Description:</b> {movie.plot || "No description yet"}</p>
          <p><b>Genre:</b> {movie.genre || "—"}</p>
          <p><b>Director:</b> {movie.director || "—"}</p>
          <p><b>Rating:</b> {movie.rating || "—"}</p>
        </div>
        <div className="movie-gif">
          <img src="https://images.melonland.net/?url=https%3A%2F%2Fi.imgur.com%2FhWxzM0d.gif&w=1200&fit=inside&we&q=85&il&n=-1&default=1" alt="Movie gif"/>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Reviews</h3>
        {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map(r => <ReviewCard key={r.id} review={r} />)}

        <div className="review-form">
          <h4>Create Review</h4>
          <textarea placeholder="Write your review" value={reviewContent} onChange={e => setReviewContent(e.target.value)} />
          <input type="number" placeholder="Rating (1-10)" min="1" max="10" value={reviewRating} onChange={e => setReviewRating(e.target.value)} />
          <button onClick={submitReview}>Submit</button>
        </div>
      </div>

      <style jsx>{`
        body, html { margin: 0; font-family: "So Bad", sans-serif; color: #333; background: #000; }
        .movie-container {
          display: flex;
          gap: 40px;
          padding: 40px 20px;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
        }
        .movie-poster img {
          width: 350px;
          height: auto;
          border-radius: 0;
          border: 4px solid #ffc659;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .movie-info { flex: 1; }
        .movie-info h2 { font-size: 36px; margin-bottom: 20px; color: #ffc659; }
        .movie-info p { font-size: 20px; line-height: 1.6; margin-bottom: 15px; }
        .movie-info b { color: #8dd9ff; }
        .movie-gif { width: 250px; flex-shrink: 0; }
        .reviews-section {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          border-top: 2px solid #584fdb;
          color: #8dd9ff;
        }
        .reviews-section h3 { font-size: 28px; color: #ffc659; margin-bottom: 15px; }
        .review-form {
          margin-top: 20px;
          padding: 15px;
          border: 2px solid #d03e78;
          background-image: url('/src/017C.png');
          background-size: 100px 100px;
          background-repeat: repeat;
          background-color: rgba(0,0,0,0.5);
          background-blend-mode: overlay;
          color: #d03e78;
        }
        .review-form textarea, .review-form input {
          width: 95%;
          margin-bottom: 10px;
          padding: 8px;
          background: #222;
          border: 1px solid #d03e78;
          color: #fff;
          font-family: "So Bad", sans-serif;
        }
        .review-form button {
          background: #584fdb;
          color: #8dd9ff;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          cursor: pointer;
          padding: 6px 12px;
          font-family: "So Bad", sans-serif;
        }
      `}</style>
    </>
  );
}
