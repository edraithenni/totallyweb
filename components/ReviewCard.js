export default function ReviewCard({ review }) {
  return (
    <div className="review">
      <p><b>User #{review.user_id}</b> rated <b>{review.rating}/10</b></p>
      <p>{review.content || ''}</p>
      <style jsx>{`
        .review {
          background: #222;
          border: 0px solid #584fdb;
          padding: 10px 15px;
          margin-bottom: 15px;
          border-radius: 0px;
        }
      `}</style>
    </div>
  );
}
