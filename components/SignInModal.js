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
          <div className="modal-frame">
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
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .error {
          color: #ffb4b4;
          margin-bottom: 0.5rem;
        }

        .modal {
          font-family: 'Basiic', sans-serif;
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
          font-family: 'Basiic', sans-serif;
          background: #000020;
          padding: 0.5rem;
          max-width: 560px;
          width: 92%;
          border-radius: 0;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          color: #4ff6fe;
        }

        .modal-frame {
          border: 3px double #4ff6fe;
          padding: 1.5rem;
          background: #000060;
          box-shadow: inset 0 0 8px #003366;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 6px;
          right: 8px;
          cursor: pointer;
          font-weight: bold;
          color: #4ff6fe;
        }

        .modal-body h2 {
          margin: 0 0 0.75rem 0;
          color: #4ff6fe;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 0.5rem;
        }

        form input {
          font-family: 'Basiic', sans-serif;
          padding: 0.6rem;
          border: 1px solid #4ff6fe;
          border-radius: 0;
          background: #000020;
          color: #4ff6fe;
        }

        form button {
          padding: 0.6rem;
          border: none;
          border-radius: 0;
          background: #004f4f;
          color: #4ff6fe;
          cursor: pointer;
          font-family: 'Basiic', sans-serif;
          transition: background 0.2s;
        }

        form button:hover {
          background: #007070;
        }
      `}</style>
    </>
  );
}
