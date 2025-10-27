import Head from "next/head";
import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import LetterGlitch from "@/components/LetterGlitch";


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
  const [showPassword, setShowPassword] = useState(false);
  const glitchChars = "▓▒░█▄■□▪▫";
  const [cursorVisible, setCursorVisible] = useState(true);


  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  function showForm(id) {
    setActive(id);
    setRegMsg("");
    setVerMsg("");
    setLogMsg("");
  }

    async function register() {
    setRegMsg("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed");
      }

  
      setVerEmail(regEmail);
      showForm("verify");
      setVerMsg("^_^ Registered successfully! Enter your verification code below.");
    } catch (err) {
      setRegMsg("X Registration error: " + (err.message || "Unknown error"));
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
    setLogMsg(""); 

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: logEmail, password: logPass }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Login failed");
      }

      const data = await res.json().catch(() => ({}));
      try {
        if (data.token) localStorage.setItem("token", data.token);
      } catch {}

  
      setLogMsg(" ^_^Login successful! Redirecting...");
      const base = window.location.pathname.startsWith("/app") ? "/app" : "";

     
      setTimeout(() => {
        window.location.href = `${base}/search`;
      }, 1000);
    } catch (err) {
   
      setLogMsg("[Х] Login error: " + (err.message || "Unknown error"));
    }
  }


  return (
    <>
      <Head>
        <title>Auth</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap"
          rel="stylesheet"
        />
      </Head>

      
<div
  style={{
    position: "fixed",
    inset: 0,
    zIndex: 0, 
    pointerEvents: "none", 
    overflow: "hidden",
  }}
>
  <LetterGlitch
    glitchSpeed={50}
    centerVignette={true}
    outerVignette={false}
    smooth={true}
  />
</div>

      <div
        className="card-wrap"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div className="card">
  <div className="card-header">
    {active === "register" && "REGISTER"}
    {active === "login" && "LOGIN"}
    {active === "verify" && "VERIFICATION"}
  </div>

  <div className="card-body">
   {/* REGISTER */}
<div style={{ display: active === "register" ? "block" : "none" }}>
  <div className={`msg ${regMsg.includes("error") ? "error" : "success"} ${regMsg ? "" : "hidden"}`}>
    {regMsg}
  </div>

  {/** Name field **/}
  <div className="input-group">
    <label htmlFor="regName">Name</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="regName"
        type="text"
        value={regName}
        onChange={(e) => setRegName(e.target.value)}
      />
      {regName === "" && <span className="cursor">_</span>}
    </div>
  </div>

  {/** Email field **/}
  <div className="input-group">
    <label htmlFor="regEmail">Email</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="regEmail"
        type="email"
        value={regEmail}
        onChange={(e) => setRegEmail(e.target.value)}
      />
      {regEmail === "" && <span className="cursor">_</span>}
    </div>
  </div>

  {/** Password field **/}
  <div className="input-group">
    <label htmlFor="regPass">Password</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="regPass"
        type="password"
        value={regPass}
        onChange={(e) => setRegPass(e.target.value)}
      />
      {regPass === "" && <span className="cursor">_</span>}
    </div>
  </div>

  <button onClick={register}>[Sign up]</button>
  <div className="switch" onClick={() => showForm("login")}>Already have an account? Log in</div>
</div>


    {/* LOGIN */}
<div style={{ display: active === "login" ? "block" : "none" }}>
  <div className={`msg ${logMsg.includes("error") ? "error" : "success"} ${logMsg ? "" : "hidden"}`}>
    {logMsg}
  </div>

  <div className="input-group">
    <label htmlFor="logEmail">Email</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="logEmail"
        type="email"
        value={logEmail}
        onChange={(e) => setLogEmail(e.target.value)}
      />
      {logEmail === "" && <span className="cursor">_</span>}
    </div>
  </div>

  <div className="input-group">
    <label htmlFor="logPass">Password</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="logPass"
        type="password"
        value={logPass}
        onChange={(e) => setLogPass(e.target.value)}
      />
      {logPass === "" && <span className="cursor">_</span>}
    </div>
  </div>

  <button onClick={login}>[Log in]</button>
  <div className="switch" onClick={() => showForm("register")}>Don't have an account? Register</div>
</div>

{/* VERIFY */}
<div style={{ display: active === "verify" ? "block" : "none" }}>
  <div className={`msg ${verMsg ? "" : "hidden"}`}>{verMsg}</div>

  <div className="input-group">
    <label htmlFor="verEmail">Email</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="verEmail"
        type="email"
        value={verEmail}
        onChange={(e) => setVerEmail(e.target.value)}
      />
      {verEmail === "" && <span className="cursor">_</span>}
    </div>
  </div>

  <div className="input-group">
    <label htmlFor="verCode">Verification Code</label>
    <div className="terminal-input">
      <span className="prompt">&gt;</span>
      <input
        id="verCode"
        type="text"
        value={verCode}
        onChange={(e) => setVerCode(e.target.value)}
      />
      {verCode === "" && <span className="cursor">_</span>}
    </div>
  </div>

  <button onClick={verify}>[Confirm]</button>
  <div className="switch" onClick={() => showForm("login")}>Go to Log in</div>
</div>

  </div>
</div>

      </div>

      <style jsx>{`
      @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        .card {
  padding: 0;
  width: 510px;
  height: 350px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 0, 0, 1); 
  color: rgba(255, 0, 0, 1);
  font-family: 'Basiic', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
        h2 {
          margin-top: 0;
        }
        input {
          width: 100%;
          padding: 0.4rem 0.5rem;
          margin-bottom: 0.4rem;
          background: rgba(0, 0, 0, 1);
          border: 1px solid rgba(255, 0, 0, 1);
          font-size: 1rem;
          font-family: 'Basiic', sans-serif;
          color: #c8edf3ff;
        }
        button {
          width: 100%;
          padding: 0.6rem 1rem;
          border: none;
          background: rgba(0, 0, 0, 0);
          font-family: 'Basiic', sans-serif;
          color: rgba(255, 0, 0, 1);
          border: 0px solid rgba(255, 0, 0, 1);
          cursor: pointer;
        }
        .switch {
          margin-top: 1rem;
          text-align: center;
          color: #ff0000ff;
          cursor: pointer;
        }
        .hidden {
          display: none;
        }
        .msg {
          background: #000000ff;
          border: 0px solid #b2f5c8;
          padding: 0.5rem;
          margin-bottom: 0.8rem;
          color: #ffffffff;
          font-size: 0.9rem;
        }
          .msg.error {
  background: #000000ff;
  border: 1px solid #ff0000ff;
  color: #8b0000;
}

.msg.success {
  background: #000000ff;
  border: 1px solid #00c60dff;
  color: #22543d;
}
.card {
  padding: 0;
  width: 510px;
  height: 350px;
  background: rgba(0, 0, 0, 0.40);
  border: 1px solid rgba(255, 0, 0, 1); 
  color: rgba(255, 0, 0, 1);
  font-family: 'Basiic', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.card-header {
  height: 34px; 
  line-height: 34px; 
  background: rgba(0, 0, 0, 1);
  color: rgba(255, 0, 0, 1); 
  padding: 0 12px; 
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  user-select: none;
  border-bottom: 1px solid rgba(255, 0, 0, 1);
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
}

.card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.35));
}

.input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.8rem;
  }

.input-group label {
    font-size: 0.6rem;
    color: rgba(255, 0, 0, 0.9);
    margin-bottom: 0.2rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    user-select: none;
  }

.input-group input {
  width: 100%;
  padding: 0.4rem 0.5rem;
  background: rgba(0, 0, 0, 1);
 
  font-size: 1rem;
  font-family: 'Basiic', sans-serif;
  color: #c8edf3ff;
}

.input-group input::placeholder {
  color: rgba(255, 0, 0, 0.8);
}

 .terminal-input {
    display: flex;
    align-items: center;
    font-family: 'Basiic', monospace;
    font-size: 1rem;
    position: relative;
  }

  .terminal-input .prompt {
    color: rgba(255, 0, 0, 0.8);
    margin-right: 0.3rem;
  }

.terminal-input input {
  background: transparent;
  border: none;
  color: #c8edf3ff;
  outline: none;
  font-family: 'Basiic', monospace;
  font-size: 1rem;
  padding-left: 1ch; /* небольшой отступ, чтобы курсор не накладывался на > */
}

.terminal-input .cursor {
  position: absolute;
  left: 1ch; 
  top: 50%;  
  transform: translateY(-50%);
  color: #ff0000ff;
  animation: blink 1s steps(2, start) infinite;
}


 @keyframes blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }



      `}</style>
    </>
  );
}
