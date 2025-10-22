// pages/review.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReviewCard from "@/components/ReviewCard";

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [review, setReview] = useState(null); // ревью будет null до загрузки
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchReview() {
      try {
        // Загружаем сам ревью
        const resReview = await fetch(`/api/reviews/${id}`, { credentials: "include" });
        if (!resReview.ok) throw new Error("Failed to load review");
        const reviewData = await resReview.json();
        setReview(reviewData);

        // Загружаем комментарии
        const resComments = await fetch(`/api/reviews/${id}/comments`, { credentials: "include" });
        if (!resComments.ok) throw new Error("Failed to load comments");
        const commentsData = await resComments.json();
        setComments(commentsData || []);
      } catch (err) {
        console.error(err);
        setReview({
          id: 0,
          user_name: "Unknown",
          user_id: 0,
          content: "Content not available",
          rating: 0,
          movie_title: "Unknown Movie",
          movie_id: 0,
        });
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    fetchReview();
  }, [id]);

  if (!review) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading review...</p>;
  }

  return (
    <div className="review-page">
      {/* Ревью всегда отображается */}
      <ReviewCard review={review} showMovieLink />

      {/* Комментарии */}
      <div className="comments-section">
        <h3>Comments</h3>
        {loadingComments ? (
          <p className="loading">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <CommentTree comments={comments} />
        )}
      </div>

      <style jsx>{`
        .review-page {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1rem;
          background: #0a1b31;
          border-radius: 10px;
          color: #d2ece3;
        }
        .comments-section {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #6c6c9c;
        }
        h3 {
          color: #41d3d2;
          margin-bottom: 1rem;
        }
        .loading {
          text-align: center;
          color: #9c9cc9;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}

// Рекурсивное дерево комментариев
function CommentTree({ comments, depth = 0 }) {
  return (
    <ul className="comment-list" style={{ marginLeft: depth * 20 }}>
      {comments.map((c) => (
        <li key={c.id} className="comment-item">
          <div className="comment-header">
            <strong>{c.user?.name || "Unknown"}</strong>
            <span className="comment-date">{formatDate(c.created_at)}</span>
          </div>
          <p className="comment-content">{c.content}</p>
          {c.replies?.length > 0 && (
            <CommentTree comments={c.replies} depth={depth + 1} />
          )}
        </li>
      ))}
      <style jsx>{`
        .comment-list {
          list-style: none;
          padding-left: 0;
        }
        .comment-item {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-left: 2px solid #41d3d2;
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #9c9cc9;
          margin-bottom: 0.2rem;
        }
        .comment-content {
          color: #d2ece3;
          line-height: 1.4;
          margin: 0;
        }
        .comment-date {
          font-style: italic;
        }
      `}</style>
    </ul>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}
