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
      {comments.map(comment => (
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

  const handleDelete = async () => {
    const confirmDelete = () => {
      toast.dismiss();
      setIsDeleting(true);
      fetch(`/api/comments/${comment.ID}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(res => {
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
          <button onClick={confirmDelete} className="confirm-yes">Yes</button>
          <button onClick={() => toast.dismiss()} className="confirm-no">Cancel</button>
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
        <button className="reply-btn" onClick={() => onReply(comment)}>Reply</button>
        {isOwner && (
          <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
        {hasReplies && (
          <button
            className={`toggle-replies-btn ${showReplies ? "expanded" : ""}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "▼" : "▶"} {comment.replies.length} replies
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
        }
        .reply-btn,
        .delete-btn,
        .toggle-replies-btn {
          background: none;
          border: none;
          color: #41d3d2;
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
          border-top: 1px solid #334;
        }
        h3 {
          margin-bottom: 1rem;
          color: #ffb3ff;
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
          background: #091a2c;
          color: #d2ece3;
          border: 1px solid #446;
          border-radius: 6px;
          padding: 0.5rem;
          min-height: 80px;
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: #41d3d2;
        }
        .comment-form-actions {
          display: flex;
          gap: 0.5rem;
        }
        button {
          background: #41d3d2;
          border: none;
          color: #0a1b31;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #2abcb9;
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
