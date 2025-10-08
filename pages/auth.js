import Head from "next/head";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [active, setActive] = useState("register");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regMsg, setRegMsg] = useState("");

  const [verEmail, setVerEmail] = useState("");
  const [verCode, setVerCode] = useState("");
  const [verMsg, setVerMsg] = useState("");

  const [logEmail, setLogEmail] = useState("");
  const [logPass, setLogPass] = useState("");
  const [logMsg, setLogMsg] = useState("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  function showForm(id) {
    setActive(id);
    setRegMsg(""); setVerMsg(""); setLogMsg("");
  }

  async function register() {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass }),
      });
      if (!res.ok) throw new Error(await res.text());
      setVerEmail(regEmail);
      showForm("verify");
      setVerMsg("Registered succesfully, enter your verification code.");
    } catch (err) {
      alert("Registration error: " + (err.message || err));
    }
  }

  async function verify() {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verEmail, code: verCode }),
      });
      if (!res.ok) throw new Error(await res.text());
      setVerMsg("Email confirmed! Please sign in.");
      showForm("login");
      setLogEmail(verEmail);
    } catch (err) {
      alert("Confirmation error: " + (err.message || err));
    }
  }

  async function login() {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: logEmail, password: logPass }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      try { if (data.token) localStorage.setItem("token", data.token); } catch {}
      const base = window.location.pathname.startsWith("/app") ? "/app" : "";
      window.location.href = `${base}/search`;
    } catch (err) {
      alert("Login error: " + (err.message || err));
    }
  }

  return (
    <>
      <Head>
        <title>Auth</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" rel="stylesheet" />
      </Head>

      <div
        className="card-wrap"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          backgroundImage: mounted ? "url('/src/starsky.gif')" : "none",
          backgroundRepeat: "repeat",
          backgroundPosition: "center center",
          backgroundSize: "auto",
        }}
      >
        <div className="card">
          <div style={{ display: active === "register" ? "block" : "none" }}>
            <h2>Register</h2>
            <div className={`msg ${regMsg ? "" : "hidden"}`}>{regMsg}</div>
            <input value={regName} onChange={e => setRegName(e.target.value)} id="regName" type="text" placeholder="Name" />
            <input value={regEmail} onChange={e => setRegEmail(e.target.value)} id="regEmail" type="email" placeholder="Email" />
            <input value={regPass} onChange={e => setRegPass(e.target.value)} id="regPass" type="password" placeholder="Password" />
            <button onClick={register}>Sign up</button>
            <div className="switch" onClick={() => showForm("login")}>Already have an account? Log in</div>
          </div>

          <div style={{ display: active === "verify" ? "block" : "none" }}>
            <h2>Confirmation</h2>
            <div className={`msg ${verMsg ? "" : "hidden"}`}>{verMsg}</div>
            <input value={verEmail} onChange={e => setVerEmail(e.target.value)} id="verEmail" type="email" placeholder="Email" />
            <input value={verCode} onChange={e => setVerCode(e.target.value)} id="verCode" type="text" placeholder="Verification code(sent to email)" />
            <button onClick={verify}>Confirm</button>
            <div className="switch" onClick={() => showForm("login")}>Go to Log in</div>
          </div>

          <div style={{ display: active === "login" ? "block" : "none" }}>
            <h2>Log in</h2>
            <div className={`msg ${logMsg ? "" : "hidden"}`}>{logMsg}</div>
            <input value={logEmail} onChange={e => setLogEmail(e.target.value)} id="logEmail" type="email" placeholder="Email" />
            <input value={logPass} onChange={e => setLogPass(e.target.value)} id="logPass" type="password" placeholder="Password" />
            <button onClick={login}>Log in</button>
            <div className="switch" onClick={() => showForm("register")}>Don't have an account? Register</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #0a1b31;
          border: 1px solid rgb(66,65,72);
          padding: 2rem;
          width: 350px;
          color: #40f;
          font-family: 'DotGothic16', monospace;
        }
        h2 { margin-top: 0; }
        input {
          width: 90%;
          padding: .6rem 1rem;
          margin-bottom: .8rem;
          background: rgb(59,59,116);
          border: 1px solid rgb(104,102,117);
          font-size: 1rem;
          font-family: 'DotGothic16', monospace;
          color: #dbeafe;
        }
        button {
          width: 100%;
          padding: .6rem 1rem;
          border: none;
          background: rgb(44,44,122);
          font-family: 'DotGothic16', monospace;
          color: #40f;
          cursor: pointer;
        }
        .switch { margin-top: 1rem; text-align: center; color: #aaaaaa; cursor: pointer; }
        .hidden { display: none; }
        .msg {
          background: #e6ffed;
          border: 1px solid #b2f5c8;
          padding: .5rem;
          margin-bottom: .8rem;
          color: #22543d;
          font-size: .9rem;
        }
      `}</style>
    </>
  );
}
