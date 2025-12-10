// ———————— полный файл, как ты просил ————————
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
  const isAdmin = currentUser && currentUser.role === "admin";

  // NEW: админ не может банить или удалять самого себя
  const adminActingOnSelf = isAdmin && isOwner;

  const hasReplies = comment.replies && comment.replies.length > 0;

  // voting
  const [isVoting, setIsVoting] = useState(false);
  const [score, setScore] = useState(comment.value ?? 0);
  const [userVote, setUserVote] = useState(comment.user_vote ?? 0);

  // banned state
  const initialBanned = !!(comment.user && (comment.user.banned || comment.user.is_banned));
  const [userBanned, setUserBanned] = useState(initialBanned);

  useEffect(() => {
    setScore(comment.value ?? 0);
    setUserVote(comment.user_vote ?? 0);
    setUserBanned(!!(comment.user && (comment.user.banned || comment.user.is_banned)));
  }, [comment]);

  const handleVote = async (type) => {
    if (comment.DeletedAt !== null || isVoting) return;

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
      if (!res.ok) return toast.error(data.error || "Vote error");

      if (typeof data.value === "number") setScore(data.value);
      if (typeof data.user_vote === "number") setUserVote(data.user_vote);
    } catch {
      toast.error("Connection error");
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
          } else toast.error("Failed to delete");
        })
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
      { autoClose: false, position: "bottom-right" }
    );
  };

  const handleAdminDelete = async () => {
    if (adminActingOnSelf) return; // защита

    if (!confirm("ADMIN: Delete this comment?")) return;

    try {
      const res = await fetch(`/api/admin/comments/${comment.ID}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error((await res.json()).error || "Admin delete failed");
        return;
      }

      toast.success("Comment deleted by admin");
      onDeleteComment();
    } catch {
      toast.error("Admin delete error");
    }
  };

  const handleAdminToggleBan = async () => {
    if (adminActingOnSelf) {
      toast.error("You cannot ban yourself");
      return;
    }

    const action = userBanned ? "unban" : "ban";

    if (!confirm(userBanned ? "Unban user?" : "Ban user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${comment.user_id}/${action}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return toast.error((await res.json()).error || "Failed");

      setUserBanned(!userBanned);
      toast.success(userBanned ? "User unbanned" : "User banned");
    } catch {
      toast.error("Ban/unban error");
    }
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
              >
                ▲
              </button>

              <span className="comment-score">{score}</span>

              <button
                className={`vote-btn down ${userVote === -1 ? "active" : ""}`}
                onClick={() => handleVote("down")}
                disabled={isVoting}
              >
                ▼
              </button>
            </div>

            <button className="reply-btn" onClick={() => onReply(comment)}>Reply</button>
          </>
        )}

        {/* OWNER DELETE */}
        {isOwner && comment.DeletedAt === null && (
          <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}

        {/* ADMIN ACTIONS: только если админ И НЕ хозяин коммента */}
        {isAdmin && !isOwner && (
          <>
            <button className="delete-btn" onClick={handleAdminDelete}>
              Admin delete
            </button>

            <button
              className="reply-btn"
              onClick={handleAdminToggleBan}
            >
              {userBanned ? "Unban user" : "Ban user"}
            </button>
          </>
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
        /* unchanged — your exact style kept */
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
          flex-wrap: wrap;
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
          border-radius: 4px;
          color: #999;
        }
        .vote-btn.up.active { color: #0a8; font-weight: 700; }
        .vote-btn.down.active { color: #f55; font-weight: 700; }

        .reply-btn,
        .delete-btn,
        .toggle-replies-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .toggle-replies-btn.expanded { color: #ffb3ff; }
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
    if (reviewId) fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      setComments(await res.json());
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
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim(), parent_id: parentID }),
      });

      if (!res.ok) throw new Error();

      setNewComment("");
      setReplyTo(null);

      await fetchComments();
      toast.success("Comment posted");
    } catch {
      toast.error("Error posting");
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
    </div>
  );
}
