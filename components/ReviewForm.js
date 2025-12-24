import { useState } from "react";
import { useTranslation } from 'next-i18next';

export default function ReviewForm({ onSubmit }) {
  const { t } = useTranslation('components');
  const [movieTitle, setMovieTitle] = useState("");
  const [rating, setRating] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!movieTitle.trim() || !rating.trim() || !content.trim()) {
      setStatus(t('reviewForm.errors.fillAllFields', { defaultValue: "Please fill out all fields." }));
      return;
    }

    const newReview = {
      movie_title: movieTitle.trim(),
      rating: parseInt(rating),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      setStatus(t('reviewForm.status.sending', { defaultValue: "Sending..." }));
      setTimeout(() => {
        setStatus(t('reviewForm.status.submitted', { defaultValue: "Review submitted!" }));
        onSubmit && onSubmit(newReview);
        setMovieTitle("");
        setRating("");
        setContent("");
        setTimeout(() => setStatus(""), 2000);
      }, 800);
    } catch (err) {
      console.error(err);
      setStatus(t('reviewForm.errors.submitError', { defaultValue: "Error submitting review." }));
    }
  };

  return (
    <div className="review-form">
      <h2 className="form-title">
        {t('reviewForm.title', { defaultValue: "Write a Review" })}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            {t('reviewForm.labels.movieTitle', { defaultValue: "Movie Title" })}
          </label>
          <input
            type="text"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            placeholder={t('reviewForm.placeholders.movieTitle', { defaultValue: "Enter movie name" })}
          />
        </div>

        <div className="form-group">
          <label>
            {t('reviewForm.labels.rating', { defaultValue: "Rating (1–10)" })}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder={t('reviewForm.placeholders.rating', { defaultValue: "Enter rating" })}
          />
        </div>

        <div className="form-group">
          <label>
            {t('reviewForm.labels.yourReview', { defaultValue: "Your Review" })}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            placeholder={t('reviewForm.placeholders.review', { defaultValue: "Share your thoughts..." })}
          />
        </div>

        <button type="submit" className="btn-submit">
          {t('reviewForm.buttons.submit', { defaultValue: "Post Review" })}
        </button>

        {status && <div className="status">{status}</div>}
      </form>

      <style jsx>{`
        .review-form {
          background: #0a1b31;
          border: 1px solid #3f3d40;
          padding: 1.5rem;
          border-radius: 6px;
          color: #fff;
          font-family: "Basiic", sans-serif;
          transition: all 0.3s ease;
        }

        .review-form:hover {
          border-color: #41d3d2;
          box-shadow: 0 4px 12px rgba(65, 211, 210, 0.1);
        }

        .form-title {
          color: #41d3d2;
          margin-bottom: 1.2rem;
          font-weight: bold;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        label {
          color: #9c9cc9;
          margin-bottom: 0.4rem;
          font-size: 0.95rem;
        }

        input,
        textarea {
          background: #0a1b31;
          border: 1px solid #3f3d40;
          color: #fff;
          padding: 0.6rem;
          font-size: 1rem;
          border-radius: 4px;
          font-family: "Basiic", sans-serif;
          outline: none;
        }

        input:focus,
        textarea:focus {
          border-color: #41d3d2;
          box-shadow: 0 0 4px rgba(65, 211, 210, 0.3);
        }

        .btn-submit {
          background: #41d3d2;
          color: #000;
          border: none;
          padding: 0.6rem 1.2rem;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s ease;
          font-family: "Basiic", sans-serif;
        }

        .btn-submit:hover {
          background: #2cb9b8;
        }

        .status {
          margin-top: 0.8rem;
          color: #9c9cc9;
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .review-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}