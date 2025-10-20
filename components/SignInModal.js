import { useState } from "react";

export default function SignInModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "reset"
  const [emailForReset, setEmailForReset] = useState("");

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
        body: JSON.stringify({
          email: f.email.value,
          password: f.password.value,
        }),
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

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = e.target.email.value.trim().toLowerCase();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setEmailForReset(email);
      setMode("reset");
    } catch (err) {
      setError(err.message || "Request error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const f = e.target;
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForReset,
          code: f.code.value,
          new_password: f.new_password.value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Reset failed");
      alert("Password reset successful. You can now log in.");
      setMode("login");
    } catch (err) {
      setError(err.message || "Reset error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="modal"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-content">
          <div className="modal-frame">
            <span className="modal-close" onClick={onClose}>
              ✖
            </span>

            <div className="modal-body">
              {mode === "login" && (
                <>
                  <h2>Sign in</h2>
                  {error && <div className="error">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <input name="email" type="email" placeholder="Email" required />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                    />
                    <small
                      className="forgot-link"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot password?
                    </small>
                    <button type="submit" disabled={loading}>
                      {loading ? "Loading..." : "Continue"}
                    </button>
                  </form>
                </>
              )}

              {mode === "forgot" && (
                <>
                  <h2>Forgot password</h2>
                  {error && <div className="error">{error}</div>}
                  <form onSubmit={handleForgot}>
                    <input
                      name="email"
                      type="email"
                      placeholder="Your account email"
                      required
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? "Sending..." : "Send reset code"}
                    </button>
                    <small
                      className="forgot-link"
                      onClick={() => setMode("login")}
                    >
                      Back to login
                    </small>
                  </form>
                </>
              )}

              {mode === "reset" && (
  <>
    <h2>Reset password</h2>
    {error && error !== "Passwords do not match" && (
      <div className="error">{error}</div>
    )}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = e.target;
        const pass1 = f.new_password.value;
        const pass2 = f.confirm_password.value;

        if (pass1 !== pass2) {
          setError("Passwords do not match");
          return;
        }

        handleReset(e);
      }}
    >
      <input
        name="code"
        type="text"
        placeholder="Verification code"
        required
      />
      <input
        name="new_password"
        type="password"
        placeholder="New password"
        required
      />
      <input
        name="confirm_password"
        type="password"
        placeholder="Confirm new password"
        required
      />
      {error === "Passwords do not match" && (
        <div className="error">Passwords do not match</div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </button>

      <small
        className="forgot-link"
        onClick={() => setMode("login")}
      >
        Back to login
      </small>
    </form>
  </>
)}

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
          background: #000020;
          padding: 0.5rem;
          max-width: 560px;
          width: 92%;
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

        .forgot-link {
          font-size: 0.8rem;
          color: #4ff6fe;
          text-align: right;
          cursor: pointer;
          text-decoration: underline;
          margin-top: -0.4rem;
        }

        .forgot-link:hover {
          color: #66ffff;
        }
      `}</style>
    </>
  );
}
