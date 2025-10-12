import Head from "next/head";
import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// === 3D СЦЕНА ЗВЁЗДНОГО ФОНА ===
function StarField({ mouse }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const cnt = 5000;
    const arr = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 800;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 800;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    return arr;
  }, []);

  const starTexture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png"
    );
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.5 + mouse[1] * 0.6;
      ref.current.rotation.y = t * 0.7 + mouse[0] * 0.6;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        color="#ffffff"
        size={2.5}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function StarBackground() {
  const [mouse, setMouse] = useState([0, 0]);

  useEffect(() => {
    const handleMove = (e) => {
      setMouse([
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ]);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "black",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <StarField mouse={mouse} />
      </Canvas>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAG0lEQVR4Xu3BAQ0AAADCIPunNsN+YAAAAAAAAAD4HAGMgAAGpIHOIAAAAASUVORK5CYII=')",
          opacity: 0.07,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// === СТРАНИЦА АВТОРИЗАЦИИ ===
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
      setVerMsg("✅ Registered successfully! Enter your verification code below.");
    } catch (err) {
      setRegMsg("❌ Registration error: " + (err.message || "Unknown error"));
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

  
      setLogMsg("✅ Login successful! Redirecting...");
      const base = window.location.pathname.startsWith("/app") ? "/app" : "";

     
      setTimeout(() => {
        window.location.href = `${base}/search`;
      }, 1000);
    } catch (err) {
   
      setLogMsg("❌ Login error: " + (err.message || "Unknown error"));
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

      {/* 🌌 Фон со звёздами */}
      <StarBackground />

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
          <div style={{ display: active === "register" ? "block" : "none" }}>
            <h2>Register</h2>
            <div className={`msg ${regMsg.includes("error") ? "error" : "success"} ${regMsg ? "" : "hidden"}`}>
  {regMsg}
</div>

            <input
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              id="regName"
              type="text"
              placeholder="Name"
            />
            <input
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              id="regEmail"
              type="email"
              placeholder="Email"
            />
            <input
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              id="regPass"
              type="password"
              placeholder="Password"
            />
            <button onClick={register}>Sign up</button>
            <div className="switch" onClick={() => showForm("login")}>
              Already have an account? Log in
            </div>
          </div>

          <div style={{ display: active === "verify" ? "block" : "none" }}>
            <h2>Confirmation</h2>
            <div className={`msg ${verMsg ? "" : "hidden"}`}>{verMsg}</div>
            <input
              value={verEmail}
              onChange={(e) => setVerEmail(e.target.value)}
              id="verEmail"
              type="email"
              placeholder="Email"
            />
            <input
              value={verCode}
              onChange={(e) => setVerCode(e.target.value)}
              id="verCode"
              type="text"
              placeholder="Verification code(sent to email)"
            />
            <button onClick={verify}>Confirm</button>
            <div className="switch" onClick={() => showForm("login")}>
              Go to Log in
            </div>
          </div>

          <div style={{ display: active === "login" ? "block" : "none" }}>
            <h2>Log in</h2>
            <div className={`msg ${logMsg.includes("error") ? "error" : "success"} ${logMsg ? "" : "hidden"}`}> {logMsg}</div>

            <input
              value={logEmail}
              onChange={(e) => setLogEmail(e.target.value)}
              id="logEmail"
              type="email"
              placeholder="Email"
            />
            <input
              value={logPass}
              onChange={(e) => setLogPass(e.target.value)}
              id="logPass"
              type="password"
              placeholder="Password"
            />
            <button onClick={login}>Log in</button>
            <div className="switch" onClick={() => showForm("register")}>
              Don't have an account? Register
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #0a1b31;
          border: 1px solid rgb(66, 65, 72);
          padding: 2rem;
          width: 350px;
          color: #40f;
          font-family: 'DotGothic16', monospace;
        }
        h2 {
          margin-top: 0;
        }
        input {
          width: 100%;
          padding: 0.6rem 1rem;
          margin-bottom: 0.8rem;
          background: rgb(59, 59, 116);
          border: 1px solid rgb(104, 102, 117);
          font-size: 1rem;
          font-family: 'DotGothic16', monospace;
          color: #dbeafe;
        }
        button {
          width: 100%;
          padding: 0.6rem 1rem;
          border: none;
          background: rgb(44, 44, 122);
          font-family: 'DotGothic16', monospace;
          color: #40f;
          cursor: pointer;
        }
        .switch {
          margin-top: 1rem;
          text-align: center;
          color: #aaaaaa;
          cursor: pointer;
        }
        .hidden {
          display: none;
        }
        .msg {
          background: #e6ffed;
          border: 1px solid #b2f5c8;
          padding: 0.5rem;
          margin-bottom: 0.8rem;
          color: #22543d;
          font-size: 0.9rem;
        }
          .msg.error {
  background: #ffe6e6;
  border: 1px solid #ffb2b2;
  color: #8b0000;
}

.msg.success {
  background: #e6ffed;
  border: 1px solid #b2f5c8;
  color: #22543d;
}

      `}</style>
    </>
  );
}
