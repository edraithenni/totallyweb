import Head from "next/head";
import { useEffect, useState } from "react";
import SignInModal from "./SignInModal";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        setLoggedIn(res.ok);
      } catch {
        setLoggedIn(false);
      }
    })();
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setLoggedIn(false);
    } catch (err) {
      alert(err.message || "Logout error");
    }
  }

  return (
    <>
      <Head>
        <link href="https://fonts.cdnfonts.com/css/so-bad" rel="stylesheet" />
      </Head>

      <header>
        <h1 onClick={() => (window.location.href = "/search")}>Totally cats</h1>
        <nav>
          {!loggedIn ? (
            <>
              <button className="primary" onClick={() => setSignOpen(true)}>Sign in</button>
              <button className="secondary" onClick={() => (window.location.href = "/auth")}>Sign up</button>
            </>
          ) : (
            <>
              <button className="secondary" onClick={() => (window.location.href = "/profile")}>Profile</button>
              <button className="secondary" onClick={logout}>Log out</button>
            </>
          )}
        </nav>
      </header>

      <SignInModal open={signOpen} onClose={() => setSignOpen(false)} onSuccess={() => setLoggedIn(true)} />

      <style jsx>{`
        header {
          background: url('/src/hat.png') repeat center top;
          height: 120px;
          background-size: auto;
          display: flex;
          align-items: center;
          padding: 0 12px;
        }
        header h1 {
          font-family: "So Bad", sans-serif;
          font-size: 3.5rem;
          letter-spacing: 0.5px;
          margin: 0;
          color: #584fdb;
          text-shadow:
            -1px -1px 0 #ffc659,
            1px -1px 0 #ffc659,
            -1px  1px 0 #ffc659,
            1px  1px 0 #ffc659,
            -2px -2px 0 #fb5255,
            2px -2px 0 #fb5255,
            -2px  2px 0 #fb5255,
            2px  2px 0 #fb5255;
        }
        header nav {
          margin-left: auto;
          display: flex;
          gap: 0.5rem;
        }
        nav button {
          margin-left: 0.5rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: "So Bad", sans-serif;
        }
        nav button.primary {
          background: #584fdb;
          color: #8dd9ff;
          border-radius: 0;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          outline-offset: 0;
        }
        nav button.secondary {
          background: #584fdb;
          color: #8dd9ff;
          border-radius: 0;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          outline-offset: 0;
        }
      `}</style>
    </>
  );
}
