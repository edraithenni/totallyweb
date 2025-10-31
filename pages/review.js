import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReviewCard from "@/components/ReviewCard";
import CommentsSection from "@/components/CommentsSection";
import Header from "../components/header";
import { ToastContainer } from "react-toastify";

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const resReview = await fetch(`/api/reviews/${id}`, { credentials: "include" });
        if (!resReview.ok) throw new Error("Failed to load review");
        const reviewData = await resReview.json();
        setReview(reviewData);
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
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    }

    fetchCurrentUser();
  }, []);


  const handleReviewUpdated = (updatedReview) => {
    setReview(updatedReview);
  };

  if (!review) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading review...</p>;
  }

  return (
    <>
      <Header />
      <div className="review-page">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />

        <ReviewCard
          review={review}
          showMovieLink
          currentUser={currentUser}
          editable={true}            
          onReviewUpdated={handleReviewUpdated} 
        />

        <CommentsSection reviewId={review.id} currentUser={currentUser} />

        <style jsx>{`
          .review-page {
            max-width: 800px;
            margin: 2rem auto;
            padding: 1rem;
            background: #141319ff;
            border-radius: 0px;
            color: #d2ece3;
            font-family: inherit;
          }
        `}</style>
      </div>
    </>
  );
}
