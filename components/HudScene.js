import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect, useMemo } from "react";

function StarField({ mouse }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const cnt = 4000;
    const arr = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 600;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 600;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 600;
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
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function StarWindow() {
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
    <>
      <div
        style={{
          width: "32vw",
          height: "32vh",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "black",
          border: "1px solid rgba(190,190,190,0.4)",
          boxShadow: "0 0 30px rgba(200,200,200,0.2)",
          overflow: "hidden",
          zIndex: 50,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ background: "black" }}
        >
          <StarField mouse={mouse} />
        </Canvas>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAG0lEQVR4Xu3BAQ0AAADCIPunNsN+YAAAAAAAAAD4HAGMgAAGpIHOIAAAAASUVORK5CYII=')",
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />
      </div>

      {}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, 20vh)", 
          color: "rgba(200,200,200,0.7)",
          fontFamily: "'Courier New', monospace",
          fontStyle: "italic",
          fontSize: "1rem",
          pointerEvents: "none",
          zIndex: 50,
          textAlign: "center",
        }}
      >
        Neural pathways through digital space...
      </div>
    </>
  );
}
