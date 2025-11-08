import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MVPPreviewWebGL() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera with dynamic FOV
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer with high quality
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // BoDiGi colors
    const colors = {
      gold: new THREE.Color(0xfbbf24),
      maroon1: new THREE.Color(0x722f37),
      maroon2: new THREE.Color(0x8b3a62),
      black: new THREE.Color(0x000000)
    };

    // Create animated gradient mesh
    const gradientGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorA: { value: colors.maroon1 },
        colorB: { value: colors.maroon2 },
        colorC: { value: colors.gold },
        mouseX: { value: 0 },
        mouseY: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Wave effect based on position and time
          float wave = sin(pos.x * 0.1 + time) * cos(pos.y * 0.1 + time) * 2.0;
          
          // Mouse interaction
          float dist = distance(vec2(pos.x, pos.y), vec2(mouseX * 100.0, mouseY * 100.0));
          wave += sin(dist * 0.1 - time * 2.0) * 1.5;
          
          pos.z = wave;
          vWave = wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform vec3 colorC;
        uniform float time;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          // Create gradient based on UV and wave
          vec3 color = mix(colorA, colorB, vUv.y);
          color = mix(color, colorC, sin(vWave * 0.5 + time) * 0.5 + 0.5);
          
          // Add glow effect
          float glow = smoothstep(0.0, 1.0, abs(sin(vWave * 0.3 + time)));
          color += colorC * glow * 0.3;
          
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial);
    gradientMesh.position.z = -30;
    scene.add(gradientMesh);

    // Floating particles
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      particlePositions[i3] = (Math.random() - 0.5) * 150;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 150;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 80;
      
      // Color (gold or maroon)
      const isGold = Math.random() > 0.5;
      const color = isGold ? colors.gold : colors.maroon2;
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
      
      // Size
      particleSizes[i] = Math.random() * 3 + 1;
      
      // Velocity
      particleVelocities[i3] = (Math.random() - 0.5) * 0.05;
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Glowing rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(15 + i * 10, 0.5, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? colors.gold : colors.maroon2,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.z = -20 - i * 5;
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      rings.push(ring);
    }

    // Mouse interaction
    const handleMouseMove = (event) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseRef.current.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      const mouse = mouseRef.current;
      
      // Smooth mouse following
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Update gradient shader
      gradientMaterial.uniforms.time.value = time;
      gradientMaterial.uniforms.mouseX.value = mouse.x;
      gradientMaterial.uniforms.mouseY.value = mouse.y;

      // Rotate gradient mesh
      gradientMesh.rotation.z = time * 0.1;

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += particleVelocities[i3];
        positions[i3 + 1] += particleVelocities[i3 + 1];
        positions[i3 + 2] += particleVelocities[i3 + 2];
        
        // Boundary check
        if (Math.abs(positions[i3]) > 75) particleVelocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 75) particleVelocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 40) particleVelocities[i3 + 2] *= -1;
        
        // Mouse interaction
        const dx = mouse.x * 50 - positions[i3];
        const dy = mouse.y * 50 - positions[i3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
          const force = (20 - distance) / 20;
          positions[i3] -= dx * force * 0.05;
          positions[i3 + 1] -= dy * force * 0.05;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate rings
      rings.forEach((ring, index) => {
        ring.rotation.z = time * (0.2 + index * 0.1);
        ring.material.opacity = 0.2 + Math.sin(time + index) * 0.1;
      });

      // Parallax camera
      camera.position.x += (mouse.x * 10 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 10 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      gradientGeometry.dispose();
      gradientMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      rings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}