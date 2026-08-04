import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const globalCss = `
  * { box-sizing: border-box; }
  
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100vw;
    overflow-x: hidden; 
    background-color: black;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -ms-overflow-style: none;  
    scrollbar-width: none;  
  }
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }

  .parallax-item { will-change: transform, opacity; }

  /* --- ANIMATED GRADIENT TEXT CLASS --- */
  .animated-gradient-text {
    background: linear-gradient(
      90deg,
      #FF0055 0%,
      #B800FF 35%,
      #FF00FF 70%,
      #FF0055 100%
    );
    background-size: 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shiftColors 4s ease infinite;
  }

  @keyframes shiftColors {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* --- HOVER EFFECTS --- */
  .hover-name, .hover-title {
    transition: all 0.3s ease-in-out;
    pointer-events: auto; 
    cursor: default;
  }
  .hover-name:hover {
    transform: scale(1.05); 
    /* Changed from yellow to a vivid Pink/Purple glow mix */
    text-shadow: 0px 4px 40px rgba(255, 0, 170, 0.9), 0px 0px 20px rgba(184, 0, 255, 0.8) !important; 
  }
  .hover-title:hover {
    transform: scale(1.05);
    text-shadow: 0px 0px 30px rgba(255, 0, 170, 1) !important; 
  }
  .hover-image {
    transition: all 0.3s ease-in-out;
    pointer-events: auto;
  }
  .hover-image:hover {
    transform: scale(1.03); 
    box-shadow: 0px 0px 50px 15px rgba(255, 0, 170, 0.8) !important; 
  }

  /* --- ENTRANCE ANIMATION EFFECTS --- */
  @keyframes slideFadeIn {
    from { opacity: 0; transform: translateX(var(--start-x, -50px)); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-entrance {
    opacity: 0; 
    animation: slideFadeIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  .from-left { --start-x: -80px; }
  .from-right { --start-x: 80px; }
  
  .delay-1 { animation-delay: 0.2s; }
  .delay-2 { animation-delay: 0.4s; }
  .delay-3 { animation-delay: 0.6s; } 
  .delay-4 { animation-delay: 0.8s; } 
  .delay-5 { animation-delay: 1.0s; } 
  .delay-6 { animation-delay: 1.2s; } 
  
  .slow-image-entrance { animation-duration: 3s; animation-delay: 1s; }

  /* --- HERO KEYWORDS --- */
  .hero-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 1.05rem;
    letter-spacing: 1.5px;
    color: #FFEA00; /* Cyberpunk Yellow for strong visibility */
    font-weight: 700;
  }
  .hero-keywords .divider {
    color: #FF00AA; /* Neon Pink divider for contrast */
    font-weight: 900;
    text-shadow: 0px 0px 10px rgba(255, 0, 170, 0.8);
  }

  /* --- HERO BUTTONS & ICONS --- */
  .social-row { display: flex; gap: 15px; margin-top: 15px; pointer-events: auto; }
  .social-icon {
    width: 45px; height: 45px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    transition: all 0.3s;
    text-decoration: none;
  }
  .social-icon:hover {
    background: rgba(255, 0, 170, 0.15);
    border-color: #FF00AA;
    color: #FF00AA;
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(255, 0, 170, 0.4);
  }
  .social-icon svg { width: 22px; height: 22px; fill: currentColor; }

  .btn-row { display: flex; gap: 15px; margin-top: 25px; pointer-events: auto; }
  .btn {
    padding: 12px 28px;
    border-radius: 8px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    font-size: 0.85rem;
    display: inline-block;
  }
  .btn-primary {
    background: rgba(255, 0, 170, 0.1);
    color: #FF00AA;
    border: 1px solid #FF00AA;
    box-shadow: 0 0 15px rgba(255, 0, 170, 0.3);
  }
  .btn-primary:hover {
    background: #FF00AA;
    color: white;
    box-shadow: 0 0 30px rgba(255, 0, 170, 0.7);
  }
  .btn-secondary {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.7);
  }
  .btn-secondary:hover {
    border-color: white;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  }

  /* --- HORIZONTAL LAYOUT UI (Details Section) --- */
  .bento-container {
    display: flex;
    flex-direction: column; 
    gap: 35px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    pointer-events: auto; 
  }
  .bento-card {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 0, 170, 0.2);
    border-radius: 24px;
    padding: 40px;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    color: rgba(255, 255, 255, 0.95);
    width: 100%; 
  }
  .bento-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 0, 170, 0.6);
    box-shadow: 0 10px 40px rgba(255, 0, 170, 0.25);
  }
  .bento-card h3 {
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 1.8rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.4);
    padding-bottom: 10px;
  }

  /* Universal Inner Grid (Used for skills/exp) */
  .inner-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }

  /* Strict 2x2 Grid specific for Education */
  .edu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  @media (max-width: 768px) {
    .edu-grid { grid-template-columns: 1fr; }
  }

  /* Content Boxes for Edu/Exp */
  .content-box {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 25px;
    border-radius: 15px;
    transition: background 0.3s, border-color 0.3s;
    height: 100%;
  }
  .content-box:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 0, 170, 0.5);
  }
  .content-box h4 { margin: 0 0 8px 0; color: white; font-size: 1.2rem; }
  .content-box p { margin: 0; color: #e0e0e0; font-size: 0.95rem; line-height: 1.5; }
  .content-box .highlight { color: #FF00AA; font-size: 0.85rem; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

  /* --- FLOATING "WIND" ANIMATION FOR EDUCATION --- */
  @keyframes floatingWind {
    0% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-6px) rotate(0.5deg); }
    66% { transform: translateY(4px) rotate(-0.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  .wind-box { animation: floatingWind 6s ease-in-out infinite; will-change: transform; }
  .wind-delay-1 { animation-delay: 0s; }
  .wind-delay-2 { animation-delay: -1.5s; }
  .wind-delay-3 { animation-delay: -3s; }
  .wind-delay-4 { animation-delay: -4.5s; }

  /* Skill Tags */
  .skill-category h4 { color: white; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem; letter-spacing: 1px; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 10px; }
  .skill-tag {
    /* Cyberpunk Yellow for strong visibility */
    background: rgba(255, 234, 0, 0.1);
    border: 1px solid rgba(255, 234, 0, 0.5);
    color: #FFEA00;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.90rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  .skill-tag:hover {
    background: rgba(255, 234, 0, 0.9);
    box-shadow: 0 0 15px rgba(255, 234, 0, 0.6);
    color: black;
  }

  /* --- VERTICAL TIMELINE FOR PROJECTS --- */
  .timeline {
    position: relative;
    max-width: 1200px;
    margin: 40px auto 0 auto;
    padding-bottom: 40px;
  }
  /* The central glowing line */
  .timeline::after {
    content: '';
    position: absolute;
    width: 2px;
    background: rgba(255, 0, 170, 0.4);
    box-shadow: 0 0 12px rgba(255, 0, 170, 0.6);
    top: 0;
    bottom: 0;
    left: 50%;
    margin-left: -1px;
  }

  .timeline-item {
    padding: 10px 40px;
    position: relative;
    background: inherit;
    width: 50%;
    margin-bottom: 40px;
  }
  .timeline-item.left { left: 0; }
  .timeline-item.right { left: 50%; }

  /* The Dots on the Line */
  .timeline-item::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    background: #FF00AA;
    border-radius: 50%;
    top: 30px;
    box-shadow: 0 0 12px #FF00AA, 0 0 24px #FF00AA;
    z-index: 1;
  }
  .timeline-item.left::after { right: -7px; }
  .timeline-item.right::after { left: -7px; }

  /* --- NEW WIDE RECTANGULAR PROJECT CARDS --- */
  .timeline-card {
    padding: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 0, 170, 0.25);
    border-radius: 16px;
    transition: all 0.3s ease;
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .timeline-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 0, 170, 0.8);
    box-shadow: 0 10px 35px rgba(255, 0, 170, 0.25);
  }

  /* The text container next to the image */
  .project-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .project-content h4 { margin: 0 0 8px 0; color: white; font-size: 1.25rem; }
  .project-content p { margin: 0; color: #f0f0f0; font-size: 0.95rem; line-height: 1.5; }
  .project-content .highlight { color: #FFEA00; font-size: 0.80rem; font-weight: bold; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1.5px;}

  /* Mirror layout for the right side of the timeline */
  .timeline-item.right .timeline-card {
    flex-direction: row-reverse;
    text-align: right;
  }
  .timeline-item.right .proj-links {
    justify-content: flex-end;
  }
  
  /* Animated Image Placeholder Box */
  @keyframes pulseBg {
    0% { background: rgba(255, 0, 170, 0.02); }
    50% { background: rgba(255, 0, 170, 0.12); }
    100% { background: rgba(255, 0, 170, 0.02); }
  }
  .project-preview {
    flex: 0 0 35%;
    height: 150px;
    border-radius: 12px;
    border: 1px dashed rgba(255, 0, 170, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF00AA;
    font-size: 0.85rem;
    font-weight: bold;
    letter-spacing: 1px;
    overflow: hidden;
    animation: pulseBg 3s infinite ease-in-out;
  }
  .project-preview img, .project-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Project Action Buttons */
  .proj-links {
    display: flex;
    gap: 12px;
    margin-top: 15px;
  }
  .proj-btn {
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.80rem;
    text-decoration: none;
    font-weight: 600;
    background: rgba(255, 0, 170, 0.1);
    color: #FF00AA;
    border: 1px solid rgba(255, 0, 170, 0.4);
    transition: all 0.2s;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .proj-btn:hover {
    background: #FF00AA;
    color: white;
    box-shadow: 0 0 20px rgba(255, 0, 170, 0.5);
  }
  .proj-btn svg { width: 14px; height: 14px; fill: currentColor; }

  /* Mobile Timeline adjustments */
  @media screen and (max-width: 900px) {
    .timeline::after { left: 31px; }
    .timeline-item { width: 100%; padding-left: 70px; padding-right: 0; }
    .timeline-item.left, .timeline-item.right { left: 0; }
    .timeline-item.left::after, .timeline-item.right::after { left: 24px; }
    
    .timeline-card, .timeline-item.right .timeline-card {
      flex-direction: column; 
      text-align: left;
    }
    .project-preview {
      width: 100%;
      flex: none;
    }
    .timeline-item.right .proj-links {
      justify-content: flex-start;
    }
  }
`;

function NeuralNetworkPlexus() {
  const pointsGeometryRef = useRef()
  const linesGeometryRef = useRef()

  const particleCount = 1000; 
  const maxDistance = 3.5;
  const spread = 45; 

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const vel = []
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread
      vel.push({ x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 })
    }
    return [pos, vel]
  }, [])

  useFrame((state) => {
    const { pointer, viewport } = state;
    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x
      positions[i * 3 + 1] += velocities[i].y
      positions[i * 3 + 2] += velocities[i].z

      const bounds = spread / 2;
      if (Math.abs(positions[i * 3]) > bounds) velocities[i].x *= -1
      if (Math.abs(positions[i * 3 + 1]) > bounds) velocities[i].y *= -1
      if (Math.abs(positions[i * 3 + 2]) > bounds) velocities[i].z *= -1

      const dxMouse = positions[i * 3] - mouseX;
      const dyMouse = positions[i * 3 + 1] - mouseY;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      const repelRadius = 4.0; 
      
      if (distMouse < repelRadius && distMouse > 0.1) {
        const force = Math.pow((repelRadius - distMouse) / repelRadius, 2) * 0.06; 
        positions[i * 3] += (dxMouse / distMouse) * force;
        positions[i * 3 + 1] += (dyMouse / distMouse) * force;
        positions[i * 3] += (dyMouse / distMouse) * force * 1.5;
        positions[i * 3 + 1] -= (dxMouse / distMouse) * force * 1.5;
      }
    }

    const linePositions = []
    const connected = new Array(particleCount).fill(false)
    const nearest = new Array(particleCount)
    for(let i=0; i<particleCount; i++) nearest[i] = { dist: Infinity, id: -1 }

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        const distanceSquared = dx*dx + dy*dy + dz*dz

        if (distanceSquared < maxDistance * maxDistance) {
          linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2], positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
          connected[i] = true
          connected[j] = true
        }
        if (distanceSquared < nearest[i].dist) { nearest[i].dist = distanceSquared; nearest[i].id = j }
        if (distanceSquared < nearest[j].dist) { nearest[j].dist = distanceSquared; nearest[j].id = i }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      if (!connected[i]) {
        const j = nearest[i].id
        if (j !== -1) { linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2], positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]) }
      }
    }

    if (pointsGeometryRef.current) pointsGeometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    if (linesGeometryRef.current) linesGeometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  })

  return (
    <group>
      <points>
        <bufferGeometry ref={pointsGeometryRef} />
        <pointsMaterial color="#00ffff" size={0.08} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef} />
        <lineBasicMaterial color="#00ffff" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

const LinkIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg>
)

function App() {
  const textGroupRef = useRef(null);
  const imageGroupRef = useRef(null);
  const bottomTextRef = useRef(null); 

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const newOpacity = Math.max(1 - scrollY / 400, 0);
          const textTranslateX = scrollY * -0.8;
          const imageTranslateX = scrollY * 0.8;

          if (textGroupRef.current) {
            textGroupRef.current.style.opacity = newOpacity;
            textGroupRef.current.style.transform = `translateY(-50%) translateX(${textTranslateX}px)`;
          }
          if (bottomTextRef.current) {
            bottomTextRef.current.style.opacity = newOpacity;
            bottomTextRef.current.style.transform = `translateX(${textTranslateX}px)`; 
          }
          if (imageGroupRef.current) {
            imageGroupRef.current.style.opacity = newOpacity;
            imageGroupRef.current.style.transform = `translateY(-50%) translateX(${imageTranslateX}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{globalCss}</style>
      <div>
        
        {/* Layer 1: FIXED 3D Background */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0, 20] }}>
            <color attach="background" args={['black']} />
            <NeuralNetworkPlexus />
            <EffectComposer>
              <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={2.0} />
            </EffectComposer>
            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
          </Canvas>
        </div>

        {/* Layer 2: SCROLLING Content */}
        <div style={{ position: 'relative', zIndex: 10, width: '100vw', pointerEvents: 'none' }}>
          
          {/* --- SECTION 1: HERO --- */}
          <section style={{ height: '100vh', width: '100%', position: 'relative' }}>
            
            <div ref={textGroupRef} className="parallax-item" style={{ position: 'absolute', top: '50%', left: '10%', transform: `translateY(-50%) translateX(0px)`, display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
              
              <div className="animate-entrance from-left delay-1">
                <h1 className="hover-name animated-gradient-text" style={{ fontFamily: '"Arial Black", Impact, sans-serif', fontWeight: '900', fontSize: '6rem', margin: 0, lineHeight: '1', textShadow: '0px 4px 25px rgba(255, 215, 0, 0.4)' }}>
                  Robin Jose
                </h1>
              </div>
              
              <div className="animate-entrance from-left delay-2">
                <h2 className="hover-title animated-gradient-text" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '2.5rem', margin: 0, letterSpacing: '2px', textShadow: '0px 0px 15px rgba(255, 0, 170, 0.6)' }}>
                  Aspiring Data Scientist
                </h2>
              </div>

              <div className="animate-entrance from-left delay-3">
                <div className="hero-keywords">
                  <span>Machine Learning</span> <span className="divider">|</span>
                  <span>NLP</span> <span className="divider">|</span>
                  <span>GEN AI</span> <span className="divider">|</span>
                  <span>Deep Learning</span> <span className="divider">|</span>
                  <span> Django </span>
                </div>
              </div>

              <div className="animate-entrance from-left delay-4">
                <div className="social-row">
                  <a href="https://www.linkedin.com/in/robin-jose-567cvyhhh66/" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                    <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="https://github.com/robin-276" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                    <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/robin_jose5?igsh=MWFleDY3MTBvNDNr" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=joserobin276@gmail.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Email">
                    <svg viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
                  </a>
                  <a href="https://wa.me/917034418083" target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">
                    <svg viewBox="0 0 24 24"><path d="M12.031 0c-6.627 0-12.031 5.403-12.031 12.031 0 2.628.851 5.064 2.304 7.042l-1.572 5.751 5.882-1.543c1.895 1.258 4.14 1.986 6.541 1.986 6.623 0 12.029-5.403 12.029-12.031 0-6.628-5.406-12.031-12.029-12.031zm6.521 17.382c-.279.79-1.597 1.513-2.213 1.583-.585.066-1.341.137-4.296-1.084-3.567-1.472-5.881-5.114-6.061-5.355-.181-.24-1.448-1.93-1.448-3.681 0-1.751.916-2.613 1.242-2.946.326-.334.71-.418.948-.418.238 0 .476.004.685.013.218.01.513-.082.802.615.305.736 1.031 2.518 1.122 2.701.092.183.153.396.031.639-.122.242-.183.396-.367.608-.184.212-.384.457-.55.631-.184.191-.384.398-.168.766.215.367.959 1.583 2.062 2.569 1.428 1.275 2.61 1.666 2.977 1.848.368.183.581.152.8-.093.218-.244.939-1.093 1.192-1.472.253-.378.507-.315.845-.192.338.123 2.14 1.01 2.507 1.194.368.183.613.275.704.428.092.153.092.885-.187 1.674z"/></svg>
                  </a>
                </div>
              </div>

              <div className="animate-entrance from-left delay-5">
                <div className="btn-row">
                  <a href="/resume.pdf" target="_blank" className="btn btn-primary">View Resume</a>
                  <a href="/resume.pdf" download className="btn btn-secondary">Download PDF</a>
                </div>
              </div>

            </div>

            <div 
              ref={bottomTextRef} 
              className="parallax-item" 
              style={{ position: 'absolute', bottom: '40px', left: '10%' }}
            >
              <div className="animate-entrance from-left delay-6">
                <p style={{ color: '#ffffff', fontSize: '1.1rem', margin: 0, letterSpacing: '1px', fontWeight: '500' }}>
                  <strong style={{ color: '#FF00AA' }}>Languages:</strong> English, Malayalam
                </p>
              </div>
            </div>

            <div ref={imageGroupRef} className="parallax-item" style={{ position: 'absolute', top: '50%', right: '12%', transform: `translateY(-50%) translateX(0px)` }}>
              <div className="animate-entrance from-right slow-image-entrance">
                <img className="hover-image" src="/profile_1.jpeg" alt="Robin Jose" style={{ width: '320px', height: '400px', objectFit: 'cover', borderRadius: '30px', border: '3px solid #FF00AA', boxShadow: '0px 0px 35px 10px rgba(255, 0, 170, 0.5)' }} />
              </div>
            </div>

          </section>

          {/* --- SECTION 2: HORIZONTAL DETAILS --- */}
          <section style={{ minHeight: '100vh', width: '100%', padding: '80px 5%', display: 'flex', alignItems: 'center' }}>
            
            <div className="bento-container">
              
              {/* Box 1: About Me */}
              <div className="bento-card">
                <h3 className="animated-gradient-text">About</h3>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', margin: 0, letterSpacing: '0.5px', color: '#f0f0f0' }}>
                  Aspiring Data Scientist with a specialized focus on Machine Learning (ML), Deep Learning (DL), and Natural Language Processing (NLP). Adept at architecting scalable models and leveraging Prompt Engineering to optimize system performance and intelligence. Committed to bridging the gap between complex neural architectures and efficient, real-world deployment through advanced technical mastery.
                </p>
              </div>

              {/* Box 2: Education (Floating Wind Effect) */}
              <div className="bento-card">
                <h3 className="animated-gradient-text">Education</h3>
                <div className="edu-grid">
                  
                  <div className="wind-box wind-delay-1">
                    <div className="content-box">
                      <span className="highlight">Advanced Certification</span>
                      <h4>Data Science & Artificial Intelligence</h4>
                      <p>AVODHA, Ernakulam<br/>Aug 2025 - Feb 2026</p>
                    </div>
                  </div>
                  
                  <div className="wind-box wind-delay-2">
                    <div className="content-box">
                      <span className="highlight">Undergraduate</span>
                      <h4>Bachelor of Computer Applications (BCA)</h4>
                      <p>SKCMS, Kuruppampady<br/>Mahatma Gandhi University | Mar 2022 - Mar 2025</p>
                    </div>
                  </div>
                  
                  <div className="wind-box wind-delay-3">
                    <div className="content-box">
                      <span className="highlight">Higher Secondary</span>
                      <h4>Computer Science</h4>
                      <p>MKHSS Vengoor<br/>Mar 2020 - Mar 2022</p>
                    </div>
                  </div>
                  
                  <div className="wind-box wind-delay-4">
                    <div className="content-box">
                      <span className="highlight">High School</span>
                      <h4>SSLC</h4>
                      <p>Kerala State Board<br/>Passed with High Distinction</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 3: Technical Skills */}
              <div className="bento-card">
                <h3 className="animated-gradient-text">Technical Skills</h3>
                <div className="inner-grid">
                  
                  <div className="skill-category">
                    <h4>Programming Languages</h4>
                    <div className="skill-tags">
                      <span className="skill-tag">C</span>
                      <span className="skill-tag">C++</span>
                      <span className="skill-tag">SQL</span>
                      <span className="skill-tag">PHP</span>
                      <span className="skill-tag">Python</span>
                      <span className="skill-tag">HTML</span>
                      <span className="skill-tag">GDScript</span>
                    </div>
                  </div>

                  <div className="skill-category">
                    <h4>Libraries & Frameworks</h4>
                    <div className="skill-tags">
                      <span className="skill-tag">Pandas</span>
                      <span className="skill-tag">NumPy</span>
                      <span className="skill-tag">TensorFlow</span>
                      <span className="skill-tag">Keras</span>
                      <span className="skill-tag">scikit-learn</span>
                      <span className="skill-tag">NLTK</span>
                      <span className="skill-tag">Seaborn</span>
                      <span className="skill-tag">Matplotlib</span>
                    </div>
                  </div>

                  <div className="skill-category">
                    <h4>Tools & Platforms</h4>
                    <div className="skill-tags">
                      <span className="skill-tag">Power BI</span>
                      <span className="skill-tag">Excel</span>
                      <span className="skill-tag">Google Sheets</span>
                      <span className="skill-tag">Google Colab</span>
                      <span className="skill-tag">VS Code</span>
                      <span className="skill-tag">GitHub</span>
                      <span className="skill-tag">Godot</span>
                      <span className="skill-tag">Replit</span>
                      <span className="skill-tag">AI Assistants</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 4: Professional Experience */}
              <div className="bento-card">
                <h3 className="animated-gradient-text">Professional Experience</h3>
                <div className="inner-grid" style={{ gridTemplateColumns: '1fr' }}>
                  
                  <div className="content-box" style={{ borderLeft: '3px solid #FF00AA', borderRadius: '5px 15px 15px 5px' }}>
                    <span className="highlight">Internship | 1 Month (1/6/2026 - 1/7/2026)</span>
                    <h4>AI / ML & Django Intern</h4>
                    <p style={{ color: '#FF00AA', marginBottom: '10px', fontWeight: 'bold' }}>
                      <a href="https://edxera.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>EDXERA, Kaloor, Kochi, Kerala</a>
                    </p>
                    <ul style={{ color: '#e0e0e0', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                      <li>Developed and deployed a full-stack website utilizing the Django framework.</li>
                      <li>Performed precise image annotation tasks using Roboflow for computer vision datasets.</li>
                      <li>Worked on various Machine Learning models and integration tasks.</li>
                    </ul>
                    <div style={{ marginTop: '15px' }}>
                      <a href="https://edxera.com/" target="_blank" rel="noopener noreferrer" className="proj-btn" style={{ display: 'inline-flex', width: 'fit-content' }}>
                        <LinkIcon /> Visit
                      </a>
                    </div>
                  </div>

                  <div className="content-box" style={{ borderLeft: '3px solid #FF00AA', borderRadius: '5px 15px 15px 5px' }}>
                    <span className="highlight">Internship | 8 Days (23/7/2025 - 1/8/2025)</span>
                    <h4>AI & ML Intern</h4>
                    <p style={{ color: '#FF00AA', marginBottom: '10px', fontWeight: 'bold' }}>
                      <a href="https://www.sinrorobotics.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>SINRO ROBOTICS, Kochi</a>
                    </p>
                    <ul style={{ color: '#e0e0e0', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                      <li>Gained hands-on experience in machine learning and AI concepts.</li>
                      <li>Implemented supervised ML models such as Linear Regression and KNN on sample datasets.</li>
                      <li>Utilized Python libraries including pandas and NumPy for advanced data processing.</li>
                      <li>Acquired practical exposure to real-world AI/ML applications in robotics.</li>
                    </ul>
                    <div style={{ marginTop: '15px' }}>
                      <a href="https://www.sinrorobotics.com/" target="_blank" rel="noopener noreferrer" className="proj-btn" style={{ display: 'inline-flex', width: 'fit-content' }}>
                        <LinkIcon /> Visit
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 5: Projects (WIDE RECTANGLE TIMELINE) */}
              <div className="bento-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                <h3 className="animated-gradient-text" style={{ padding: '40px 40px 0 40px', borderBottom: 'none' }}>ProJects</h3>
                
                <div className="timeline">
                  
                  {/* Project 1 - Left */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/Wafer_defect.jpg" alt="Wafer Defect Classn" /></div>
                      <div className="project-content">
                        <span className="highlight">Python, Machine Learning</span>
                        <h4>Wafer Defect Classification</h4>
                        <p>Developed an optimized Random Forest machine learning model to classify defects in semiconductor wafers, achieving 96% accuracy.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/Avodha_Projects/blob/main/DS__Project_of_ML_.pdf" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> Check it out
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 2 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/NLP.jpg" alt="Fake News Detection" /></div>
                      <div className="project-content">
                        <span className="highlight">Python, NLP</span>
                        <h4>Fake News Detection</h4>
                        <p>Built an NLP model on 80K+ news articles utilizing tokenization, stopword removal, and lemmatization. Achieved 80% accuracy.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/Data-science-projects-/blob/main/NLP_Fake_News_Detection.pdf" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> Check it out
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 3 - Left */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/auto_hub.jpg" alt="Auto Hub " /></div>
                      <div className="project-content">
                        <span className="highlight">Python, Django</span>
                        <h4>Auto Hub Booking Platform</h4>
                        <p>Engineered a web-based platform to help users quickly locate and book nearby autos with secure user authentication.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/College-Projects/tree/main/Main_Project/autohub" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> Check it out
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 4 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/College_Magazine.jpg" alt="College Magazine CMS" /></div>
                      <div className="project-content">
                        <span className="highlight">PHP, MySQL, HTML</span>
                        <h4>College Magazine CMS</h4>
                        <p>Built a comprehensive digital Content Management System for St. Kuriakose College to showcase articles and news.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/College-Projects/tree/main/Mini%20project/College-magazine/project" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> Check it out
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 5 - Left */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/stud_manag.jpg" alt="Student Management Portal" /></div>
                      <div className="project-content">
                        <span className="highlight">Python, Django</span>
                        <h4>Student Management Portal</h4>
                        <p>A scalable backend management system designed to track student data, attendance, and academic records securely.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/Django_Projects/tree/main/Student_Managment_Portal" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 6 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/Hr_manag.jpg" alt="HR Management Portal" /></div>
                      <div className="project-content">
                        <span className="highlight">Python, Django</span>
                        <h4>HR Management Portal</h4>
                        <p>A full-stack application for managing employee data, payroll, and internal company resources with role-based access.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/Django_Projects/tree/main/Website_for_HR" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 7 - Left */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/gst.jpg" alt="GST Calculator" /></div>
                      <div className="project-content">
                        <span className="highlight">Python, Django</span>
                        <h4>GST Calculator</h4>
                        <p>A dynamic web utility for instantly calculating precise Goods and Services Tax metrics for financial reporting.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/Django_Projects/tree/main/GST_Calculator" target='_blank' rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 8 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/portfolio.png" alt="3D Interactive Portfolio" /></div>
                      <div className="project-content">
                        <span className="highlight">React, Three.js</span>
                        <h4>3D Interactive Portfolio</h4>
                        <p>This exact website! A custom-built portfolio featuring a fluid, GPU-accelerated 3D neural network background.</p>
                        <div className="proj-links">
                          <a href="https://github.com/robin-276/My_Portfolio" target='_blank' rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> You are here
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 9 - Left (NEW: IoT Predictive Maintenance) */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview">I<img src="/IOT_Machin_defect.png" alt="IoT Predictive Maintenance" /></div>
                      <div className="project-content">
                        <span className="highlight">ML, Python, Django</span>
                        <h4>IoT Predictive Maintenance</h4>
                        <p>Implemented an LGBMClassifier machine learning model to predict equipment failures before they occur, featuring comprehensive data visualizations using Matplotlib and Seaborn.</p>
                        <div className="proj-links">
                          <a href="#" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 10 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/Moonshot.jpg.png" alt="Flappy Doge Game" /></div>
                      <div className="project-content">
                        <span className="highlight">HTML5, CSS3, JS, PHP, PostgreSQL</span>
                        <h4>Flappy Doge Game</h4>
                        <p>A Flappy Doge game website built with the help of AI, playable seamlessly on both mobile and desktop. Features a PHP/PostgreSQL backend hosted on the InfinityFree platform to track and display a real-time leaderboard of the top 5 players with their names and scores.</p>
                        <div className="proj-links">
                          <a href="https://www.google.com/search?q=flappymoonshotdoge.free.nf&oq=f&gs_lcrp=EgZjaHJvbWUqCAgBEEUYJxg7MgYIABBFGDkyCAgBEEUYJxg7MhMIAhAuGIMBGMcBGLEDGNEDGIAEMgwIAxAjGCcYgAQYigUyBggEEEUYOzIQCAUQLhiDARixAxiABBiKBTINCAYQABiDARixAxiABDIQCAcQLhjHARixAxjRAxiABDITCAgQLhiDARjHARixAxjRAxiABDIQCAkQABiDARixAxiABBiKBdIBCTUzMDNqMGoxNagCCLACAfEFAsIgYUGTqMY&sourceid=chrome&ie=UTF-8" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 11 - Left (NEW: Gym Tracking Web App) */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview">I<img src="/gym_tracking_web.webp" alt="Gym Tracking Web App" /></div>
                      <div className="project-content">
                        <span className="highlight">Next.js, Supabase, TypeScript, Tailwind CSS</span>
                        <h4>Gym Tracking Web App</h4>
                        <p>A full-stack fitness tracking web application that enables users to log workouts, monitor their progress, and organize fitness routines through a clean, responsive dashboard. Built with secure authentication, real-time database integration, and deployed on Vercel.</p>
                        <div className="proj-links">
                          <a href="#" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 12 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/gym_tracking_apk.webp" alt="Gym Tracking Android App" /></div>
                      <div className="project-content">
                        <span className="highlight">Flutter, Dart, Supabase</span>
                        <h4>Gym Tracking Android App</h4>
                        <p>A cross-platform Android application designed for tracking workouts and fitness progress. Features secure authentication, cloud-based data synchronization with Supabase, and an intuitive mobile-first interface for managing daily training sessions. </p>
                        <div className="proj-links">
                          <a href="#" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 13 - Left (SearchBOX) */}
                  <div className="timeline-item left">
                    <div className="timeline-card">
                      <div className="project-preview">I<img src="/search_box.webp" alt="SearchBOX" /></div>
                      <div className="project-content">
                        <span className="highlight">Next.js, React, TypeScript, Supabase, Tailwind CSS</span>
                        <h4>SearchBOX</h4>
                        <p>A personal resource management platform that helps users save, organize, and instantly search websites, YouTube videos, Google Drive files, GitHub repositories, documents, and notes. Features smart categories, hashtags, duplicate detection, favorites, automatic favicon fetching, and Google/Email authentication.</p>
                        <div className="proj-links">
                          <a href="https://searchbox-001.vercel.app/" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project 14 - Right */}
                  <div className="timeline-item right">
                    <div className="timeline-card">
                      <div className="project-preview"><img src="/benchy.webp" alt="Gym Tracking Android App" /></div>
                      <div className="project-content">
                        <span className="highlight">Next.js, React, Tailwind CSS</span>
                        <h4>Company project</h4>
                        <p>Developed a modern, responsive corporate website during my trainee role, focusing on performance, accessibility, and user experience. Built with Next.js to deliver a fast, SEO-friendly web presence while collaborating on a real-world client project. </p>
                        <div className="proj-links">
                          <a href="#" target="_blank" rel="noopener noreferrer" className="proj-btn">
                            <LinkIcon /> View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </>
  )
}

export default App