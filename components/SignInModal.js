import { useState } from "react";

export default function SignInModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const f = e.target;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: f.email.value, password: f.password.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content">
          <span className="modal-close" onClick={onClose}>
            ✖
          </span>
          <div className="modal-body">
            <h2>Sign in</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input name="email" type="email" placeholder="Email" required />
              <input name="password" type="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .error {
          color: #ffb4b4;
          margin-bottom: 0.5rem;
        }
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          color: #4ff6fe;
        }
        .modal-content {
          background: #0000a0;
          padding: 1rem;
          max-width: 500px;
          width: 90%;
          border-radius: 0;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          outline: 2px solid #4ff6fe;
          color: #ce3ed0;
        }
        .modal-close {
          float: right;
          cursor: pointer;
          font-weight: bold;
          color: #4ff6fe;
        }
        .modal-body h2 {
          margin: 0 0 0.75rem 0;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 0.5rem;
          color: #4ff6fe;
        }
        form input {
          padding: 0.6rem;
          border-radius: 0;
          border: 1px solid #4ff6fe;
          background: #4ff6fe;
        }
        form button {
          padding: 0.6rem;
          border: none;
          border-radius: 0;
          background: #008080ff;
          color: #000000;
          cursor: pointer;
          font-family: "So Bad", sans-serif;
        }
      `}</style>
    </>
  );
}
