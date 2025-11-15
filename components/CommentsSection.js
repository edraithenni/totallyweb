import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

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

function CommentTree({ comments, currentUser, onDeleteComment, onReply, depth = 0 }) {
  return (
    <ul className="comment-tree">
      {comments.map((comment) => (
        <CommentItem
          key={comment.ID}
          comment={comment}
          currentUser={currentUser}
          onDeleteComment={onDeleteComment}
          onReply={onReply}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function CommentItem({ comment, currentUser, onDeleteComment, onReply, depth = 0 }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const isOwner = currentUser && currentUser.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;


  const [isVoting, setIsVoting] = useState(false);

const [score, setScore] = useState(comment.Value ?? 0);
const [userVote, setUserVote] = useState(comment.user_vote ?? 0);

useEffect(() => {
  setScore(comment.Value ?? 0);
  setUserVote(comment.user_vote ?? 0);
}, [comment.Value, comment.user_vote]);


const handleVote = async (type) => {
  if (!comment || comment.DeletedAt !== null) return;
  if (isVoting) return;

  setIsVoting(true);

  let action = type;
  if ((type === "up" && userVote === 1) || (type === "down" && userVote === -1)) {
    action = "remove";
  }

  try {
    const res = await fetch(`/api/comments/${comment.ID}/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error && data.error !== "no vote to remove") toast.error(data.error);
      return;
    }

    if (typeof data.value === "number") setScore(data.value);
    if (typeof data.user_vote === "number") setUserVote(data.user_vote);

  } catch (err) {
    toast.error("Ошибка соединения");
  } finally {
    setIsVoting(false);
  }
};

  const handleDelete = async () => {
    const confirmDelete = () => {
      toast.dismiss();
      setIsDeleting(true);
      fetch(`/api/comments/${comment.ID}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            onDeleteComment();
            toast.success("Comment deleted");
          } else {
            toast.error("Failed to delete comment");
          }
        })
        .catch(() => toast.error("Error deleting comment"))
        .finally(() => setIsDeleting(false));
    };

    toast.info(
      <div className="confirm-toast">
        <p>Delete this comment?</p>
        <div className="confirm-actions">
          <button onClick={confirmDelete} className="confirm-yes">
            Yes
          </button>
          <button onClick={() => toast.dismiss()} className="confirm-no">
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, position: "bottom-right" }
    );
  };

  return (
    <li className="comment-item" style={{ marginLeft: depth * 20 }}>
      <div className="comment-header">
        <div className="comment-user">
          <img
            src={comment.user?.avatar || "/src/default_pfp.png"}
            width={32}
            height={32}
            style={{ borderRadius: "50%" }}
          />
          <Link href={`/profile?id=${comment.user_id}`} className="comment-user-link">
            <strong>{comment.user?.name || "Unknown"}</strong>
          </Link>
        </div>
        <span className="comment-date">{formatDateTime(comment.CreatedAt)}</span>
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-actions">
        {comment.DeletedAt === null && (
          <>
            <div className="vote-group">
              <button
                className={`vote-btn up ${userVote === 1 ? "active" : ""}`}
                onClick={() => handleVote("up")}
                disabled={isVoting}
                aria-pressed={userVote === 1}
                title="Upvote"
              >
                ▲
              </button>
              <span className="comment-score" aria-live="polite">
                {score}
              </span>
              <button
                className={`vote-btn down ${userVote === -1 ? "active" : ""}`}
                onClick={() => handleVote("down")}
                disabled={isVoting}
                aria-pressed={userVote === -1}
                title="Downvote"
              >
                ▼
              </button>
            </div>

            <button className="reply-btn" onClick={() => onReply(comment)}>
              Reply
            </button>
          </>
        )}

        {isOwner && comment.DeletedAt === null && (
          <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
        {hasReplies && (
          <button
            className={`toggle-replies-btn ${showReplies ? "expanded" : ""}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "▼hide replies" : "▶show replies"}
          </button>
        )}
      </div>

      {hasReplies && showReplies && (
        <CommentTree
          comments={comment.replies}
          currentUser={currentUser}
          onDeleteComment={onDeleteComment}
          onReply={onReply}
          depth={depth + 1}
        />
      )}

      <style jsx>{`
        .comment-item {
          border-left: 2px solid #2a3f5f;
          margin-top: 0.8rem;
          padding-left: 1rem;
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .comment-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .comment-user-link {
          color: #d2ece3;
          text-decoration: none;
        }
        .comment-user-link:hover {
          color: #41d3d2;
        }
        .comment-date {
          color: #999;
          font-size: 0.8rem;
        }
        .comment-content {
          margin-top: 0.3rem;
          color: #d2ece3;
          white-space: pre-wrap;
        }
        .comment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.4rem;
          align-items: center;
        }
        .vote-group {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .vote-btn {
          background: none;
          border: 1px solid transparent;
          padding: 0.15rem 0.4rem;
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1;
          border-radius: 4px;
          color: #999;
          user-select: none;
        }
        .vote-btn:hover {
          text-decoration: underline;
        }
        .vote-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .vote-btn.up.active {
          color: #0a8;
          font-weight: 700;
          text-shadow: 0 0 6px rgba(10, 136, 136, 0.18);
        }
        .vote-btn.down.active {
          color: #f55;
          font-weight: 700;
          text-shadow: 0 0 6px rgba(255, 85, 85, 0.12);
        }
        .comment-score {
          min-width: 2.2rem;
          text-align: center;
          color: #d2ece3;
          font-weight: 600;
        }
        .reply-btn,
        .delete-btn,
        .toggle-replies-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .reply-btn:hover,
        .delete-btn:hover,
        .toggle-replies-btn:hover {
          text-decoration: underline;
        }
        .toggle-replies-btn.expanded {
          color: #ffb3ff;
        }
        .confirm-yes,
        .confirm-no {
          margin-right: 0.5rem;
        }
      `}</style>
    </li>
  );
}

export default function CommentsSection({ reviewId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reviewId) return;
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data || []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const postComment = async (parentID = null) => {
    if (!newComment.trim()) return toast.error("Write something first");

    setIsPosting(true);
    try {
      const payload = { content: newComment.trim() };
      if (parentID) payload.parent_id = parentID;

      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setNewComment("");
      setReplyTo(null);
      await fetchComments();
      toast.success("Comment posted!");
    } catch {
      toast.error("Error posting comment");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommentTree
          comments={comments}
          currentUser={currentUser}
          onDeleteComment={fetchComments}
          onReply={setReplyTo}
        />
      )}

      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? `Replying to ${replyTo.user?.name}...` : "Write a comment..."}
        />
        <div className="comment-form-actions">
          <button onClick={() => postComment(replyTo?.ID)} disabled={isPosting || !newComment.trim()}>
            {isPosting ? "Posting..." : "Post"}
          </button>
          {replyTo && (
            <button className="cancel-reply-btn" onClick={() => setReplyTo(null)}>
              Cancel Reply
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .comments-section {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(60, 51, 68, 1);
          font-family: "Basiic", sans-serif;
        }
        h3 {
          margin-bottom: 1rem;
          color: #8dd9ff;
          font-size: 1.3rem;
        }
        .comment-form {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        textarea {
          width: 100%;
          background: #282439ff;
          color: #d2ece3;
          border: 1px solid #446;
          border-radius: 0px;
          padding: 0.5rem;
          min-height: 80px;
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: #16131aff;
        }
        .comment-form-actions {
          display: flex;
          gap: 0.5rem;
        }
        button {
          background: #556;
          border: none;
          color: #0a1b31;
          border-radius: 0px;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #8dd9ff;
        }
        .cancel-reply-btn {
          background: #334;
          color: #d2ece3;
        }
        .cancel-reply-btn:hover {
          background: #556;
        }
      `}</style>
    </div>
  );
}
