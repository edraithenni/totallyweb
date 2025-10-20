
import { useState } from "react";
import Link from "next/link";

import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";


export default function ReviewCard({ review, showMovieLink = false, showUserLink = false, currentUser, onReviewDeleted}) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const maxLength = 200;
  const needsTruncation = review.content && review.content.length > maxLength;
  const displayContent = expanded ? review.content : 
    needsTruncation ? review.content.substring(0, maxLength) + "..." : (review.content || "No content");

  const isOwner = currentUser && currentUser.id === review.user_id;

  const deleteReview = async () => {
  confirmAction("Are you sure you want to delete this review?", async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Review deleted!");
        if (onReviewDeleted) {
          onReviewDeleted(); 
        }
      } else {
        toast.error("Failed to delete review");
      }
    } catch (err) { 
      toast.error("Error deleting review");
    } finally {
      setIsDeleting(false);
    }
  });
}
  const safeRating = () => {
    try {
      const rating = Number(review.rating);
      if (isNaN(rating) || rating < 0) return 0;
      if (rating > 10) return 10;
      return Math.floor(rating);
    } catch {
      return 0;
    }
  };


  const confirmAction = (message, onConfirm) => {
  const toastId = toast.info(
    <div>
      <p>{message}</p>
      <button onClick={() => {
        onConfirm();
        toast.dismiss(toastId);
      }}>Confirm</button>
      <button onClick={() => toast.dismiss(toastId)}>Cancel</button>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
    }
  );
};
  const filledStars = safeRating();
  const emptyStars = Math.max(0, 10 - filledStars); 

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

   
  
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="user-info">
          <Link href={`/profile?id=${review.user_id}`} className="user-link">
            <img 
                src={review.user_avatar || "/src/default_pfp.png"} 
                alt={review.user_name || "User"} 
                className="user-avatar"
            />
            <span className="user-name">{review.user_name || "Unknown User"}</span>
           </Link>

        </div>
        {showMovieLink && (
        <div className="movie-info">
          <Link href={`/details?id=${review.movie_id}`} className="movie-link">
            {review.movie_title || "Unknown Movie"}
            </Link>
        </div>
        )}
        {isOwner && (
            <button
                onClick={deleteReview}
                disabled={isDeleting}
                className="delete-review-btn flex items-center gap-2"
            >
                {isDeleting ? (
                "Deleting..."
                ) : (
                <Image
                    src="/src/trash-full-pastel.png"
                    alt="Delete"
                    width={20}
                    height={20}
                />
                )}
            </button>
            )}
      </div>

      
      <div className="review-rating">
        <div className="stars">
          {"★".repeat(filledStars)}{"☆".repeat(emptyStars)}
        </div>
        <span className="rating-text">{safeRating()}/10</span>
      </div>

    
      <div className="review-content">
        <p>{displayContent}</p>
        {needsTruncation && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="expand-btn"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>


      <div className="review-footer">
        <span className="review-date">{formatDate(review.created_at)}</span>
        
        <div className="review-stats">
          {review.likes_count > 0 && (
            <span className="likes-count">
              ♥ {review.likes_count}
            </span>
          )}
          {review.comments_count > 0 && (
            <span className="comments-count">
              💬 {review.comments_count}
            </span>
          )}
        </div>
      </div>
  
      <style jsx>{`

        

        .review-card {
          background: #0a1b31;
          border: 1px solid #727d79;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .review-card:hover {
          border-color: #d2ece3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(65, 211, 210, 0.1);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          position: relative; 
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          text-decoration: none;
          color: inherit;
        }

        .user-link:hover {
          color: #41d3d2;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0px solid #3a3a90;
        }

        .user-name {
          color: #d2ece3;
          font-weight: bold;
          top: -10px; 
          margin-left: 0.4rem; 
          position: relative;
        }

        .movie-info {
          text-align: right;
        }

        .movie-link {
          color: #ffb3ff;
          text-decoration: none;
          font-weight: bold;
        }

        .movie-link:hover {
          text-decoration: underline;
        }

        .movie-title {
          color: #ffb3ff;
          font-weight: bold;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .stars {
          color: #829a91ff;
          font-size: 1.1rem;
          letter-spacing: -0.5px;
        }

        .rating-text {
          color: #9c9cc9;
          font-size: 0.9rem;
        }

        .review-content {
          margin-bottom: 1rem;
        }

        .review-content p {
          color: #d2ece3;
          line-height: 1.5;
          margin: 0;
        }

        .expand-btn {
          background: none;
          border: none;
          color: #41d3d2;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          margin-top: 0.5rem;
        }

        .expand-btn:hover {
          text-decoration: underline;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          
          border-top: 1px solid #6c6c9c;
        }

        .review-date {
          color: #6c6c9c;
          font-size: 0.9rem;
        }

        .review-stats {
          display: flex;
          gap: 1rem;
        }

        .likes-count, .comments-count {
          color: #9c9cc9;
          font-size: 0.9rem;
        }


  .delete-review-btn {
  top: 0;
  right: 0;
  background: #000;
  border: 1px solid #ff0033;
  color: #661929ff;
  font-family: var(--font-terminal);
  padding: 4px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 0 5px #ff0033;
}


.delete-review-btn:hover {
  background: #651025ff;
  transform: scale(1.1);
  color: #000;
  box-shadow: 0 0 10px #ff0033;
}

        @media (max-width: 480px) {
          .review-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .movie-info {
            text-align: left;
          }

          .stars {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}