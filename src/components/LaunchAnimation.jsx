import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL Launch Animation
 * Triggers particle burst effect when MVP goes live
 */
export default function LaunchAnimation({ isActive, onComplete }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create particle burst
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // BoDiGi colors
    const goldColor = new THREE.Color(0xfbbf24);
    const greenColor = new THREE.Color(0x10b981);
    const maroonColor = new THREE.Color(0x722f37);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start all particles at center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Random explosion velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 5 + Math.random() * 10;

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;

      // Color - mix of gold, green, maroon
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.5) {
        color = goldColor;
      } else if (colorChoice < 0.8) {
        color = greenColor;
      } else {
        color = maroonColor;
      }

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Random sizes
      sizes[i] = Math.random() * 4 + 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = { geometry, material, velocities, positions };

    // Create expanding rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xfbbf24 : i === 1 ? 0x10b981 : 0x722f37,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);
      rings.push({ mesh: ring, scale: 0 });
    }

    // Animation
    let time = 0;
    const duration = 3; // 3 seconds animation

    const animate = () => {
      if (time >= duration) {
        // Animation complete
        if (onComplete) onComplete();
        return;
      }

      requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Update particles
      const positions = particlesRef.current.positions;
      const velocities = particlesRef.current.velocities;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update position with velocity and gravity
        positions[i3] += velocities[i3] * 0.1;
        positions[i3 + 1] += velocities[i3 + 1] * 0.1;
        positions[i3 + 2] += velocities[i3 + 2] * 0.1;

        // Add slight gravity
        velocities[i3 + 1] -= 0.05;

        // Slow down over time
        velocities[i3] *= 0.98;
        velocities[i3 + 1] *= 0.98;
        velocities[i3 + 2] *= 0.98;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      // Fade out particles
      const fadeProgress = time / duration;
      particlesRef.current.material.opacity = 1 - fadeProgress;

      // Expand and fade rings
      rings.forEach((ring, index) => {
        ring.scale += 0.3 + index * 0.1;
        ring.mesh.scale.set(ring.scale, ring.scale, 1);
        ring.mesh.material.opacity = Math.max(0, 0.8 - fadeProgress);
      });

      // Rotate camera slightly
      camera.position.x = Math.sin(time * 0.5) * 2;
      camera.position.y = Math.cos(time * 0.5) * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      rings.forEach(ring => {
        ring.mesh.geometry.dispose();
        ring.mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    />
  );
}