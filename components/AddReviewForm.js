import { useState } from "react";

export default function AddReviewForm({ onSubmit }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("Please enter your review.");
    onSubmit(text, rating);
    setText("");
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} className="add-review-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review..."
        rows={3}
      />
      <div className="form-bottom">
        <label>
          Rating:
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} ★
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Send</button>
      </div>

      <style jsx>{`
        .add-review-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        textarea {
          width: 100%;
          background: #000;
          color: #fff;
          border: 1px solid #3a3a90;
          padding: 0.5rem;
          font-family: inherit;
        }

        .form-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        button {
          background: #41d3d2;
          color: #000;
          border: 1px solid #41d3d2;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
        }

        select {
          background: #0a1b31;
          color: #fff;
          border: 1px solid #3a3a90;
          margin-left: 0.5rem;
        }
      `}</style>
    </form>
  );
}
