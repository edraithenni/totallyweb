import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/router";

function CommentTree({ comments, currentUser, onUpdateComment, onDeleteComment, onReply, depth = 0 }) {
  return (
    <ul className="comment-tree">
      {comments.map(comment => (
        <CommentItem
          key={comment.ID}
          comment={comment}
          currentUser={currentUser}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          onReply={onReply}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function CommentItem({ comment, currentUser, onUpdateComment, onDeleteComment, onReply, depth = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleUpdate = async () => {
    try {
      const commentId = comment.ID;
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdateComment();
        toast.success('Comment updated');
      } else {
        toast.error('Failed to update comment');
      }
    } catch (err) {
      toast.error('Error updating comment');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = () => {
      toast.dismiss();
      setIsDeleting(true);
      fetch(`/api/comments/${comment.ID}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => {
          if (res.ok) {
            onDeleteComment();
            toast.success('Comment deleted');
          } else {
            toast.error('Failed to delete comment');
          }
        })
        .catch(err => {
          toast.error('Error deleting comment');
        })
        .finally(() => {
          setIsDeleting(false);
        });
    };

    toast.info(
      <div className="confirm-toast">
        <p>Are you sure you want to delete this comment?</p>
        <div className="confirm-actions">
          <button onClick={confirmDelete} className="confirm-yes">Yes, delete</button>
          <button onClick={() => toast.dismiss()} className="confirm-no">Cancel</button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        position: "bottom-right"
      }
    );
  };

  const isOwner = currentUser && currentUser.id === comment.user_id;
  const commentUserId = comment.user_id;

  return (
    <li className="comment-item" style={{ marginLeft: depth * 20 }}>
      <div className="comment-header">
        <div className="comment-user">
          <img 
            src={comment.user?.avatar || "/src/default_pfp.png"} 
           
            width={32}
            height={32}
            style={{ borderRadius: '50%' }}
            className="user-avatar"
          />
          <div className="comment-user-info">
            <Link 
              href={`/profile?id=${commentUserId}`} 
              className="comment-user-link"
              onClick={e => e.stopPropagation()}
            >
              <strong>{comment.user?.name || 'Unknown'}</strong>
            </Link>
          </div>
        </div>
        <span className="comment-date">{formatDateTime(comment.CreatedAt)}</span>
      </div>

      {isEditing ? (
        <div className="edit-comment">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
          />
          <div className="edit-actions">
            <button onClick={handleUpdate} disabled={!editContent.trim()}>
              Save
            </button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      <div className="comment-actions">
        <button 
          className="reply-btn"
          
          onClick={() => onReply(comment)}
        >
          Reply
        </button>
        
        {isOwner && !isEditing && (
          <>
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button 
              className="delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '🗑️ Deleting...' : 'Delete'}
            </button>
          </>
        )}

        {hasReplies && (
          <button 
            className={`toggle-replies-btn ${showReplies ? 'expanded' : ''}`}
            onClick={() => setShowReplies(!showReplies)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {showReplies ? '▼' : '▶'} 
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {hasReplies && showReplies && (
        <CommentTree 
          comments={comment.replies}
          currentUser={currentUser}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          onReply={onReply}
          depth={depth + 1}
        />
      )}
    </li>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return "Unknown date";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return "Invalid date";
  }
}

function countAllComments(comments) {
  let count = 0;
  function countRecursive(commentList) {
    commentList.forEach(comment => {
      count++;
      if (comment.replies && comment.replies.length > 0) {
        countRecursive(comment.replies);
      }
    });
  }
  countRecursive(comments);
  return count;
}

export default function ReviewCard({ review, showMovieLink = false, currentUser, onReviewDeleted, showComments = true,}) {
  const router = useRouter(); 
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const maxLength = 200;
  const needsTruncation = review.content && review.content.length > maxLength;
  const displayContent = expanded ? review.content : 
    needsTruncation ? review.content.substring(0, maxLength) + "..." : (review.content || "No content");

  const isOwner = currentUser && currentUser.id === review.user_id;

  useEffect(() =>{
    if (!review?.id) return;
    if (!showComments) return;
    if (!commentsVisible) return;
    fetchComments();
  }, [review?.id, commentsVisible]);

  const fetchComments = async () => {
     setLoadingComments(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/comments`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load comments");
      }
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async (parentID = null) =>{
    if(!newComment || newComment.trim().length == 0){
      toast.error("Write something before post");
      return;
    }

    if(newComment.length > 5000){
      toast.error("Too long text")
      return
    }

    setIsPosting(true);

    try{
      const payload = {
          content: newComment.trim(),
      };

      if(parentID)  payload.parent_id = parentID;

      const res = await fetch(`/api/reviews/${review.id}/comments`, {
        method : "POST",
        credentials : "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if(!currentUser?.id){
        toast.error("To post you need to be logged in")
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("post comment error", err);
        toast.error("Failed to post comment");
        return;
      }
      const created = await res.json();
      setNewComment("");
      setReplyTo(null);
      await fetchComments();
      toast.success("Comment posted!");
    } catch (err) {
      console.error(err);
      toast.error("Error occured while posting");
    }finally{
      setIsPosting(false);
    }
  };

  const deleteReview = async (e) => {
    e.stopPropagation();
    
    const confirmDelete = () => {
      toast.dismiss();
      setIsDeleting(true);
      fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(res => {
          if (res.ok) {
            toast.success("Review deleted!");
            if (onReviewDeleted) {
              onReviewDeleted(); 
            }
          } else {
            toast.error("Failed to delete review");
          }
        })
        .catch(err => { 
          toast.error("Error deleting review");
        })
        .finally(() => {
          setIsDeleting(false);
        });
    };

    toast.info(
      <div className="confirm-toast">
        <p>Are you sure you want to delete this review?</p>
        <div className="confirm-actions">
          <button onClick={confirmDelete} className="confirm-yes">Yes, delete</button>
          <button onClick={() => toast.dismiss()} className="confirm-no">Cancel</button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        position: "top-center"
      }
    );
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

  const filledStars = safeRating();
  const emptyStars = Math.max(0, 10 - filledStars); 

  const totalCommentsCount = commentsVisible ? countAllComments(comments) : (review.comments_count || countAllComments(comments) || 0);

  return (
    <div className="review-card" onClick={() => router.push(`/review?id=${review.id}`)} >
      
      <div className="review-header">
        <div className="user-info">
          <Link href={`/profile?id=${review.user_id}`} className="user-link" onClick={e => e.stopPropagation()}>
            <img 
                src={review.user_avatar || "/src/default_pfp.png"} 
                alt={review.user_name || "User"} 
                width={32}
                height={32}
                className="user-avatar"
            />
            <span className="user-name">{review.user_name || "Unknown User"}</span>
           </Link>
        </div>
        {showMovieLink && (
          <div className="movie-info">
            <Link href={`/details?id=${review.movie_id}`} className="movie-link" onClick={e => e.stopPropagation()}>
              {review.movie_title || "Unknown Movie"}
            </Link>
          </div>
        )}
        {isOwner && (
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
                src={isHovered ? "/src/trash-puff-sad.gif" : "/src/trash-full-pastel.png"}
                alt="Delete"
                width={25}
                height={25}
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
        <span className="review-date">{formatDateTime(review.CreatedAt || review.created_at)}</span>
        
        <div className="review-stats">
          {review.likes_count > 0 && (
            <span className="likes-count">
              ♥ {review.likes_count}
            </span>
          )}
          <span className="comments-count">
            💬 {totalCommentsCount}
          </span>
        </div>
      </div>
  
      {showComments && (
        <div className="comments-section" onClick={e => e.stopPropagation()}>
          <button 
            className="toggle-comments-btn"
            onClick={() => setCommentsVisible(!commentsVisible)}
          >
            {commentsVisible ? 'Hide' : 'Show'} Comments ({totalCommentsCount})
          </button>

          {commentsVisible && (
            <>
              {loadingComments ? (
                <p className="loading-comments">Loading comments...</p>
              ) : (
                <CommentTree 
                  comments={comments}
                  currentUser={currentUser}
                  onUpdateComment={fetchComments}
                  onDeleteComment={fetchComments}
                  onReply={setReplyTo}
                />
              )}

              <div className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Replying to ${replyTo.user?.name || replyTo.User?.name}...` : "Write a comment..."}
                  rows="3"
                />
                <div className="comment-form-actions">
                  <button 
                    onClick={() => postComment(replyTo?.ID || replyTo?.id)} 
                    disabled={isPosting || !newComment.trim()}
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                  {replyTo && (
                    <button 
                      className="cancel-reply-btn"
                      onClick={() => setReplyTo(null)}
                    >
                      Cancel Reply
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .review-card {
          background: #0a1b31;
          border: 1px solid #727d79;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
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
          object-fit: cover;
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
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-review-btn:hover {
          transform: scale(1.1);
        }

        .delete-review-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .comments-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #6c6c9c;
        }

        .toggle-comments-btn {
          background: #41d3d2;
          color: #0a1b31;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 1rem;
        }

        .toggle-comments-btn:hover {
          background: #36b9b8;
        }

        .loading-comments {
          text-align: center;
          color: #9c9cc9;
          margin: 1rem 0;
        }

        .comment-tree {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }

        .comment-item {
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid #727d79;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .comment-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comment-user-info {
          display: flex;
          flex-direction: column;
        }

        .comment-user-link {
          text-decoration: none;
          color: inherit;
        }

        .comment-user-link:hover {
          color: #41d3d2;
        }


        .comment-date {
          color: #6c6c9c;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .comment-content {
          color: #d2ece3;
          line-height: 1.4;
          margin: 0.5rem 0;
        }

        .comment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .reply-btn, .edit-btn, .delete-btn, .toggle-replies-btn {
          background: rgba(37, 255, 255, 0.1);
          border: 1px solid #41d3d2;
          color: #41d3d2;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-family: inherit;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .reply-btn:hover, .edit-btn:hover, .toggle-replies-btn:hover {
          background: #41d3d2;
          color: #0a1b31;
          transform: translateY(-1px);
        }

        .delete-btn {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .delete-btn:hover {
          background: #ff6b6b;
          color: #0a1b31;
          transform: translateY(-1px);
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .toggle-replies-btn {
          background: rgba(156, 156, 201, 0.1);
          border-color: #9c9cc9;
          color: #9c9cc9;
          margin-left: auto;
        }

        .toggle-replies-btn:hover {
          background: #9c9cc9;
          color: #0a1b31;
        }

        .toggle-replies-btn.expanded {
          background: #9c9cc9;
          color: #0a1b31;
        }

        .comment-form {
          margin-top: 1rem;
        }

        .comment-form textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #727d79;
          border-radius: 4px;
          padding: 0.5rem;
          color: #d2ece3;
          font-family: inherit;
          resize: vertical;
          min-height: 60px;
        }

        .comment-form textarea:focus {
          outline: none;
          border-color: #41d3d2;
        }

        .comment-form-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .comment-form-actions button {
          background: #41d3d2;
          color: #0a1b31;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
        }

        .comment-form-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-reply-btn {
          background: #6c6c9c !important;
          color: #d2ece3 !important;
        }

        .edit-comment textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #41d3d2;
          border-radius: 4px;
          padding: 0.5rem;
          color: #d2ece3;
          font-family: inherit;
          resize: vertical;
          min-height: 60px;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .edit-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
        }

        .edit-actions button:first-child {
          background: #41d3d2;
          color: #0a1b31;
        }

        .edit-actions button:last-child {
          background: #6c6c9c;
          color: #d2ece3;
        }

        .confirm-toast {
          padding: 0.5rem;
        }

        .confirm-toast p {
          margin: 0 0 1rem 0;
          color: #d2ece3;
        }

        .confirm-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .confirm-yes {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        }

        .confirm-no {
          background: #6c6c9c;
          color: #d2ece3;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
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

          .comment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .comment-actions {
            flex-wrap: wrap;
          }

          .confirm-actions {
            flex-direction: column;
          }

          .comment-date {
            font-size: 0.7rem;
          }

          .toggle-replies-btn {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}