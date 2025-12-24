import { useEffect, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import SignInModal from "../components/SignInModal";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function DetailsPage() {
  const { t } = useTranslation('details');
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const movieId = params?.get("id");
  const validReviews = Array.isArray(reviews) ? reviews : [];
  const averageRating =
    validReviews.length > 0
      ? (
          validReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          validReviews.length
        ).toFixed(1)
      : null;

  useEffect(() => {
    if (!movieId) return;
    
    fetch(`/api/movies/${movieId}`)
      .then(res => res.json())
      .then(setMovie)
      .catch(() => setMovie(null));

    loadReviews();
  }, [movieId]);
  
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const me = await res.json();
          setCurrentUser(me);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCurrentUser();
  }, []);

  async function loadReviews() {
    if (!movieId) return;
    try {
      const res = await fetch(`/api/movies/${movieId}/reviews`);
      if (res.ok) setReviews(await res.json());
    } catch {}
  }

  async function submitReview() {
    // Check if user is logged in
    if (!currentUser) {
      setSignInModalOpen(true);
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 10) {
      alert(t('reviews.ratingError', { defaultValue: 'Rating must be between 1 and 10' }));
      return;
    }
    try {
      const res = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          content: reviewContent, 
          rating: parseInt(reviewRating), 
          contains_spoiler: !!containsSpoiler 
        })
      });
      if (res.ok) {
        toast.success(t('reviews.submitSuccess', { defaultValue: 'Review submitted successfully!' }));
        setReviewContent("");
        setReviewRating(0);
        setContainsSpoiler(false);
        loadReviews();
      } else {
        alert(t('reviews.submitError', { defaultValue: 'Failed to submit review' }));
      }
    } catch (err) { 
      alert(t('reviews.networkError', { defaultValue: 'Error submitting review' })); 
    }
  }

  if (!movie) return <div>{t('page.loading', { defaultValue: 'Loading...' })}</div>;

  return (
    <>
      <Header />
      <div className="movie-container">
        
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
          <AddToPlaylistButton 
            movieId={movieId} 
            movieTitle={movie.title}
            onSuccess={() => toast.success(t('playlist.addSuccess', { defaultValue: 'Added to playlist!' }))}
            onError={() => toast.error(t('playlist.addError', { defaultValue: 'Failed to add to playlist' }))}
          />
        </div>
        <div className="movie-info">
          <h2>{movie.title}</h2>
          <p><b>{t('movieInfo.year', { defaultValue: 'Year' })}:</b> {movie.year || t('movieInfo.na', { defaultValue: '—' })}</p>
          <p><b>{t('movieInfo.description', { defaultValue: 'Description' })}:</b> {movie.plot || t('page.noDescription', { defaultValue: 'No description yet' })}</p>
          <p><b>{t('movieInfo.genre', { defaultValue: 'Genre' })}:</b> {movie.genre || t('movieInfo.na', { defaultValue: '—' })}</p>
          <p><b>{t('movieInfo.director', { defaultValue: 'Director' })}:</b> {movie.director || t('movieInfo.na', { defaultValue: '—' })}</p>
          <p><b>{t('movieInfo.rating', { defaultValue: 'Rating' })}:</b> {movie.rating || t('movieInfo.na', { defaultValue: '—' })}</p>
          {averageRating && (
            <p className="website-rating">
              <b>{t('movieInfo.rating', { defaultValue: 'Rating' })}:</b> ★ {averageRating}/10 ({reviews.length} {t('reviews.sectionTitle', { defaultValue: 'Reviews' }).toLowerCase()})
            </p>
          )}
        </div>
        <div className="movie-gif">
          <img src="https://images.melonland.net/?url=https%3A%2F%2Fi.imgur.com%2FhWxzM0d.gif&w=1200&fit=inside&we&q=85&il&n=-1&default=1" alt="Movie gif"/>
        </div>
      </div>

      <div className="reviews-section">
        <h3>{t('reviews.sectionTitle', { defaultValue: 'Reviews' })}</h3>
        {validReviews.length === 0 ? (
          <p>{t('reviews.noReviews', { defaultValue: 'No reviews yet.' })}</p>
        ) : (
          validReviews.map(r => (
            <ReviewCard 
              key={r.id} 
              review={r}
              currentUser={currentUser}
              onReviewDeleted={loadReviews}
              onReviewClick={() => {
                if (!currentUser) {
                  setSignInModalOpen(true);
                }
              }} 
            />
          ))
        )}

        <div className="review-form">
          <h4>{t('reviews.createReview', { defaultValue: 'Create Review' })}</h4>
          <textarea
            placeholder={t('reviews.writeReview', { defaultValue: 'Write your review' })}
            value={reviewContent}
            onChange={e => setReviewContent(e.target.value)}
          />
          
          <div className="star-rating">
            <span style={{ marginRight: '10px', color: '#8dd9ff' }}>
              {t('reviews.ratingPlaceholder', { defaultValue: 'Rating (1-10)' })}:
            </span>
            {[1,2,3,4,5,6,7,8,9,10].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || reviewRating) ? "filled" : ""}`}
                onClick={() => setReviewRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>

          <div className="review-form-footer">
            <button onClick={submitReview}>
              {t('reviews.submit', { defaultValue: 'Submit' })}
            </button>
            <label className="spoiler-checkbox">
              <input
                type="checkbox"
                checked={containsSpoiler}
                onChange={(e) => setContainsSpoiler(e.target.checked)}
              />
              <span>{t('reviews.containsSpoiler', { defaultValue: 'Contains Spoiler' })}</span>
            </label>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      <SignInModal 
        open={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
        onSuccess={() => {
          setSignInModalOpen(false);
          // Reload current user after successful login
          fetch("/api/users/me", { credentials: "include" })
            .then(res => res.ok && res.json())
            .then(user => user && setCurrentUser(user))
            .catch(console.error);
        }}
      />

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        body, html { margin: 0; font-family: "Basiic", sans-serif; color: #333; background: #000; }
        .movie-container {
          display: flex;
          font-family: 'Basiic', sans-serif;
          gap: 40px;
          padding: 40px 20px;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
        }
        .movie-poster {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        .movie-info b { color: #4f4f4fff; }
        .movie-gif { width: 250px; flex-shrink: 0; }

        .reviews-section {
          font-family: 'Basiic', sans-serif;
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          border-top: 2px solid #584fdb;
          color: #8dd9ff;
        }
        .reviews-section h3 { 
          font-family: 'Basiic', sans-serif; 
          font-size: 28px; 
          color: #ffc659; 
          margin-bottom: 15px; 
        }
        .review-form {
          font-family: 'Basiic', sans-serif;
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
        .review-form h4 {
          color: #ffc659;
          margin-bottom: 15px;
        }
        .review-form textarea {
          font-family: 'Basiic', sans-serif;
          width: 100%;
          height: 100px;
          margin-bottom: 15px;
          padding: 10px;
          background: #222;
          border: 1px solid #d03e78;
          color: #fff;
          resize: vertical;
        }
        .review-form button {
          background: #47101bff;
          color: #d03e78;
          border: 2px solid #d03e78;
          outline: 2px solid #fb5255;
          cursor: pointer;
          padding: 8px 16px;
          font-family: 'Basiic', sans-serif;
          font-size: 16px;
          transition: all 0.3s;
        }
        .review-form button:hover {
          background: #d03e78;
          color: #fff;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 15px;
          cursor: pointer;
          font-size: 24px;
          user-select: none;
        }

        .review-form .spoiler-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0;
          white-space: nowrap;
          font-size: 14px;
          font-weight: bold;
          color: #d03e78;
          cursor: pointer;
        }

        .review-form .spoiler-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          border: 2px solid #d03e78;
          accent-color: #d03e78;
        }

        .review-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .star {
          color: #444;
          transition: color 0.2s;
        }

        .star.filled {
          color: #ffc659;
        }
        
        .website-rating {
          color: #8dd9ff;
          font-size: 18px;
        }
        
        .website-rating b {
          color: #ffc659;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['details', 'common','components','modal'])),
    },
  };
}