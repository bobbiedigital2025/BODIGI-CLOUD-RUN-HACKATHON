import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Avatar3D({ agentType = 'aura', isSpeaking = false }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Colors and styling based on agent type
    const agentConfig = agentType === 'aura' 
      ? {
          // Aura - Feminine, organic, flowing
          primary: 0x10b981, // Green
          secondary: 0x34d399,
          glow: 0x6ee7b7,
          particleColor: 0x6ee7b7,
          geometry: 'smooth', // More organic shape
          wireframeOpacity: 0.25
        }
      : {
          // Boltz - Masculine, geometric, tech
          primary: 0xfbbf24, // Gold/Yellow
          secondary: 0xf59e0b,
          glow: 0xfcd34d,
          particleColor: 0xfcd34d,
          geometry: 'angular', // More geometric
          wireframeOpacity: 0.35
        };

    // Create avatar based on type
    let mainGeometry;
    
    if (agentType === 'aura') {
      // Aura - Smooth, organic sphere (feminine)
      mainGeometry = new THREE.SphereGeometry(1, 32, 32);
    } else {
      // Boltz - Geometric, angular shape (masculine/robotic)
      mainGeometry = new THREE.OctahedronGeometry(1, 0);
    }
    
    // Main avatar material
    const avatarMaterial = new THREE.MeshPhongMaterial({
      color: agentConfig.primary,
      emissive: agentConfig.secondary,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    const avatar = new THREE.Mesh(mainGeometry, avatarMaterial);
    scene.add(avatar);

    // Wireframe overlay with different patterns
    let wireframeGeometry;
    if (agentType === 'aura') {
      wireframeGeometry = new THREE.SphereGeometry(1.02, 16, 16); // Smooth wireframe for feminine
    } else {
      wireframeGeometry = new THREE.OctahedronGeometry(1.03, 1); // Angular wireframe for masculine
    }
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: agentConfig.glow,
      wireframe: true,
      transparent: true,
      opacity: agentConfig.wireframeOpacity
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    avatar.add(wireframe);

    // Energy particles around avatar
    const particleCount = agentType === 'aura' ? 40 : 60; // Fewer for Aura (elegant), more for Boltz (tech)
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.3 + Math.random() * 0.3;

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleSizes[i] = Math.random() * 2 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: agentConfig.particleColor,
      size: agentType === 'aura' ? 0.04 : 0.06, // Smaller for Aura (delicate), larger for Boltz
      transparent: true,
      opacity: agentType === 'aura' ? 0.7 : 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    avatar.add(particles);

    avatarRef.current = { avatar, wireframe, particles, material: avatarMaterial };

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      if (avatarRef.current) {
        const { avatar, wireframe, particles, material } = avatarRef.current;

        // Different rotation speeds
        if (agentType === 'aura') {
          // Aura - Smooth, flowing rotation (feminine)
          avatar.rotation.y += 0.008;
          wireframe.rotation.y -= 0.012;
          wireframe.rotation.x += 0.004;
        } else {
          // Boltz - Faster, more mechanical rotation (masculine/robotic)
          avatar.rotation.y += 0.012;
          avatar.rotation.x += 0.006;
          wireframe.rotation.y -= 0.018;
          wireframe.rotation.x += 0.006;
        }

        // Speaking animation
        if (isSpeaking) {
          const pulse = 1 + Math.sin(time * 10) * 0.15;
          avatar.scale.set(pulse, pulse, pulse);
          material.emissiveIntensity = 0.5 + Math.sin(time * 8) * 0.3;
        } else {
          // Breathing effect - different patterns
          const breatheSpeed = agentType === 'aura' ? 2 : 2.5; // Slower for Aura (calm), faster for Boltz
          const breatheAmount = agentType === 'aura' ? 0.04 : 0.06;
          const breathe = 1 + Math.sin(time * breatheSpeed) * breatheAmount;
          avatar.scale.set(breathe, breathe, breathe);
          material.emissiveIntensity = 0.3;
        }

        // Particle orbit - different speeds
        if (agentType === 'aura') {
          particles.rotation.y += 0.015; // Graceful orbit
          particles.rotation.x += 0.008;
        } else {
          particles.rotation.y += 0.025; // Energetic orbit
          particles.rotation.x += 0.012;
        }

        // Particle pulse
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const offset = i * 3;
          const radius = Math.sqrt(
            positions[offset] ** 2 + 
            positions[offset + 1] ** 2 + 
            positions[offset + 2] ** 2
          );
          const pulseSpeed = agentType === 'aura' ? 3 : 4;
          const pulse = 1 + Math.sin(time * pulseSpeed + i) * 0.1;
          const newRadius = radius * pulse;
          const scale = newRadius / radius;
          
          positions[offset] *= scale;
          positions[offset + 1] *= scale;
          positions[offset + 2] *= scale;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      mainGeometry.dispose();
      avatarMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [agentType, isSpeaking]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '64px', 
        height: '64px',
        borderRadius: '50%',
        overflow: 'hidden'
      }} 
    />
  );
}