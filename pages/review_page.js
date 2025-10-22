import { useEffect, useState } from "react";
import Header from "../components/header";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/reviews?page=${page}&sort=${sortBy}&q=${searchQuery}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.data || [];
        setHasMore(data.hasMore ?? false);
        setReviews(prev => (page === 1 ? list : [...prev, ...list]));
      } catch (err) {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    }
     
    loadReviews();
  }, [page, sortBy, searchQuery]);
  const handleAddReview = async (newReview) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      const data = await res.json();
      setReviews(prev => [data, ...prev]);
      setMessage("Review added successfully!");
      setShowForm(false);
    } catch {
      setMessage("Error submitting review.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); 
  };
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const loadMore = () => setPage(prev => prev + 1);

  return (
    <>
      <Header />
      <div className="reviews-page">
        <h1 className="page-title">Reviews</h1>

        <div className="controls">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
          <button onClick={() => setShowForm(true)} className="btn btn-add">
            Write a Review
          </button>
        </div>

        {message && <div className="message">{message}</div>}
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {!loading && reviews.length === 0 && !error && (
          <p className="muted">No reviews yet.</p>
        )}

        <div className="reviews-list">
          {reviews.map((rv) => (
            <ReviewCard key={rv.id} review={rv} showUserLink={true} showMovieLink={true} />
          ))}
        </div>

        {hasMore && !loading && (
          <button className="btn btn-load" onClick={loadMore}>
            Load More
          </button>
        )}

        {showForm && (
          <div className="modal open">
            <div className="modal-content">
              <div className="close-modal" onClick={() => setShowForm(false)}>&times;</div>
              <ReviewForm onSubmit={handleAddReview} submitting={submitting} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .reviews-page {
          max-width: 700px;
          margin: 2rem auto;
          background: #0a1b31;
          padding: 1.5rem;
          border: 2px solid #3f3d40;
          color: #9c9cc9;
          font-family: 'Basiic', sans-serif;
        }
        .page-title {
          color: #fff;
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }
        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .search-input, .sort-select {
          background: #000;
          color: #fff;
          border: 1px solid #41d3d2;
          padding: 6px;
        }
        .btn {
          cursor: pointer;
          padding: 0.45rem 0.75rem;
          font-family: 'Basiic', sans-serif;
        }
        .btn-add {
          background: #41d3d2;
          color: #000;
          border: 1px solid #41d3d2;
        }
        .btn-load {
          margin-top: 1rem;
          background: #000;
          color: #fff;
          border: 1px solid #41d3d2;
        }
        .message {
          color: #41d3d2;
          margin-bottom: 0.5rem;
        }
        .error {
          color: #ff8080;
          margin-bottom: 0.5rem;
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal.open { display: flex; }
        .modal-content {
          background: #0a1b31;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          width: 90%;
          max-width: 500px;
        }
        .close-modal {
          position: absolute;
          top: 10px;
          right: 20px;
          color: white;
          cursor: pointer;
          font-size: 2rem;
        }
      `}</style>
    </>
  );
}

