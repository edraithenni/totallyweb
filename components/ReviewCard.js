import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useState } from "react";

function formatDateTime(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ReviewCard({
  review,
  showMovieLink = false,
  currentUser,
  onReviewDeleted,
  editable = false,
  onReviewUpdated,
  onReviewClick,
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content || "");
  const [editRating, setEditRating] = useState(review.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [editContainsSpoiler, setEditContainsSpoiler] = useState(
    !!(review.contains_spoiler || review.containsSpoiler || review.spoiler)
  );

  const maxLength = 200;
  const needsTruncation = review.content && review.content.length > maxLength;
  const displayContent =
    expanded || isEditing
      ? review.content
      : needsTruncation
      ? review.content.substring(0, maxLength) + "..."
      : review.content || "No content";

  const isOwner = currentUser && currentUser.id === review.user_id;


  const deleteReview = async (e) => {
    e.stopPropagation();
    if (!isOwner) return;
    const confirmDelete = () => {
      toast.dismiss();
      setIsDeleting(true);
      fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            toast.success("Review deleted!");
            if (onReviewDeleted) onReviewDeleted();
          } else {
            toast.error("Failed to delete review");
          }
        })
        .catch(() => toast.error("Error deleting review"))
        .finally(() => setIsDeleting(false));
    };

    toast.info(
      <div className="confirm-toast">
        <p>Are you sure you want to delete this review?</p>
        <div className="confirm-actions">
          <button onClick={confirmDelete} className="confirm-yes">
            Yes, delete
          </button>
          <button onClick={() => toast.dismiss()} className="confirm-no">
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, position: "top-center" }
    );
  };

  const saveEdit = async () => {
    if (!editContent.trim()) return toast.error("Content cannot be empty");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editContent, rating: editRating, contains_spoiler: !!editContainsSpoiler }),
      });

      if (res.ok) {
        const updated = await res.json();

        const updatedReview = {
          ...review,
          ...updated,
          id: review.id,
          user_id: review.user_id,
          user_name: review.user_name,
          user_avatar: review.user_avatar,
          movie_id: review.movie_id,
          movie_title: review.movie_title,
          contains_spoiler: updated.contains_spoiler ?? !!editContainsSpoiler,
        };

        toast.success("Review updated!");
        setIsEditing(false);

        if (onReviewUpdated) onReviewUpdated(updatedReview);
      } else {
        toast.error("Failed to update review");
      }
    } catch {
      toast.error("Error updating review");
    } finally {
      setIsSaving(false);
    }
  };

  const safeRating = () => {
    const rating = Number(isEditing ? editRating : review.rating);
    if (isNaN(rating) || rating < 0) return 0;
    if (rating > 10) return 10;
    return Math.floor(rating);
  };

  const filledStars = safeRating();
  const emptyStars = Math.max(0, 10 - filledStars);
  const hasSpoiler = !!(review.contains_spoiler || review.containsSpoiler || review.spoiler);

  const handleReviewCardClick = () => {
    if (isEditing) return;
    if (!currentUser) {
      onReviewClick && onReviewClick();
      return;
    }
    router.push(`/review?id=${review.id}`);
  };

  return (
    <div
      className="review-card"
      onClick={handleReviewCardClick}
    >
      <div className="review-header">
   <div className="user-info">
  <Link href={`/profile?id=${review.user_id}`} className="user-link" onClick={e => e.stopPropagation()}>
    <div className="avatar-name-wrapper">
      <div className="avatar-wrapper">
      <Image
        src={review.user_avatar || "/src/default_pfp.png"}
        alt={review.user_name || "User"}
        width={32}
        height={32}
        className="user-avatar"
      />
      </div>
      <span className="user-name">{review.user_name || "Unknown User"}</span>
    </div>
  </Link>
</div>


        {showMovieLink && (
          <div className="movie-info">
            <Link
              href={`/details?id=${review.movie_id}`}
              className="movie-link"
              onClick={(e) => e.stopPropagation()}
            >
              {review.movie_title || "Unknown Movie"}
            </Link>
          </div>
        )}

        {isOwner && (
          <div className="owner-actions">
            {editable && !isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="edit-btn"
              >
                ✎ Edit
              </button>
            )}
            <button
              onClick={deleteReview}
              disabled={isDeleting}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="delete-review-btn"
            >
              {isDeleting ? (
                "🗑️"
              ) : (
                <Image
                  src={
                    isHovered
                      ? "/src/trash-puff-sad.gif"
                      : "/src/trash-full-pastel.png"
                  }
                  alt="Delete"
                  width={25}
                  height={25}
                />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="review-rating">
        {isEditing ? (
          <div className="star-rating">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <span
                key={star}
                className={`star ${
                  star <= (hoverRating || editRating) ? "filled" : ""
                }`}
                onClick={() => setEditRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
        ) : (
          <div className="stars">
            {"★".repeat(filledStars) + "☆".repeat(emptyStars)}
            <span className="rating-text">{safeRating()}/10</span>
          </div>
        )}
      </div>

      <div className="review-content">
        {isEditing ? (
          <>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={editContainsSpoiler}
                onChange={(e) => setEditContainsSpoiler(e.target.checked)}
              />
              <span>Contains Spoiler</span>
            </label>
            <div className="edit-buttons">
              <button onClick={saveEdit} disabled={isSaving}>
                Save
              </button>
              <button onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {hasSpoiler && !spoilerRevealed ? (
              <div
                className="spoiler-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpoilerRevealed(true);
                }}
              >
                <h1 className="logo glitch" data-text="SPOILERS">SPOILERS</h1>
              </div>
            ) : (
              <>
                <p>{displayContent}</p>
                {needsTruncation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                    className="expand-btn"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="review-footer">
        <span className="review-date">
          { formatDateTime(review.created_at)}
        </span>
        <div className="review-stats">
          {review.likes_count > 0 && (
            <span className="likes-count">♥ {review.likes_count}</span>
          )}
          <span className="comments-count">💬 {review.comments_count || 0}</span>
        </div>
      </div>

      <style jsx>{`
        .review-card {
          background: #0b1020;
          border: 1px solid #d2ece3;
          padding: 16px;
          margin-bottom: 20px;
          border-radius: 0px;
          color: #d2ece3;
          font-family: "Basiic", sans-serif;
          transition: 0.2s;
          cursor: pointer;
        }
        .review-card:hover {
          border-color: #828b95ff;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
       .avatar-name-wrapper {
          display: flex;
          align-items: center; 
          gap: 0.5rem;
        }

       .avatar-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden; 
          flex-shrink: 0;
        }

        .user-name {
          font-weight: bold;
          color: #d2ece3;
          line-height: 1; 
          
        }

        .movie-link {
          color: #8dd9ff;
          text-decoration: underline;
        }
        .owner-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .edit-btn {
          background: #47101bff;
          color: #d03e78;
          border: 2px solid #d03e78;
          outline: 2px solid #fb5255;
          cursor: pointer;
          padding: 4px 8px;
          font-family: inherit;
        }
        .delete-review-btn {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .review-content textarea {
          width: 100%;
          min-height: 80px;
          background: #1b1b1b;
          color: #fff;
          border: 1px solid #d03e78;
          padding: 6px;
          font-family: inherit;
        }
        .edit-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .edit-buttons button {
          background: #47101bff;
          color: #d03e78;
          border: 2px solid #d03e78;
          outline: 2px solid #fb5255;
          cursor: pointer;
          padding: 4px 10px;
          font-family: inherit;
        }
        .star-rating {
          display: flex;
          gap: 4px;
          font-size: 22px;
          margin-bottom: 6px;
        }
        .star {
          color: #444;
          transition: color 0.2s;
        }
        .star.filled {
          color: #d03e78;
        }
        .review-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 14px;
          color: #8dd9ff;
        }
        .expand-btn {
          background: none;
          color: #d03e78;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .spoiler-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          background: linear-gradient(90deg, rgba(0,0,0,0.8), rgba(10,10,10,0.95));
          border: 2px dashed #cc00ff;
          cursor: pointer;
          text-align: center;
        }

        :root {
          --terminal-purple: #cc00ff;
          --font-header: 'VT323', 'Share Tech Mono', monospace;
          --animation-slow: 4s;
        }

        .logo.glitch {
          font-family: var(--font-header);
          font-size: 2rem;
          color: var(--terminal-purple);
          margin: 0;
          letter-spacing: 0.6rem;
          text-transform: uppercase;
          text-shadow:
            0 0 10px rgba(204, 0, 255, 0.7),
            0 0 20px rgba(204, 0, 255, 0.5);
          animation: logo-pulse var(--animation-slow) infinite alternate;
          position: relative;
        }

        .logo.glitch::before,
        .logo.glitch::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0.8;
        }

        .logo.glitch::before {
          color: #ff0033;
          transform: translate(-2px, -1px);
        }

        .logo.glitch::after {
          color: #00ccff;
          transform: translate(2px, 1px);
        }

        @keyframes logo-pulse {
          0% {
            text-shadow:
              0 0 10px rgba(255, 0, 0, 0.7),
              0 0 20px rgba(255, 0, 0, 0.4);
          }
          100% {
            text-shadow:
              0 0 15px rgba(255, 0, 0, 0.9),
              0 0 30px rgba(255, 0, 0, 0.7),
              0 0 50px rgba(255, 0, 0, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
