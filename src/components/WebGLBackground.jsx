import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particleLayersRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    sceneRef.current = scene;

    // Camera setup with depth
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 100;

    // Renderer setup with enhanced quality
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // BoDigi Brand Colors with alpha variations for depth
    const colorPalette = {
      gold: new THREE.Color(0xfbbf24),
      maroon1: new THREE.Color(0x722f37),
      maroon2: new THREE.Color(0x8b3a62),
      green: new THREE.Color(0x10b981),
      black: new THREE.Color(0x000000)
    };

    // Create multiple particle layers for depth
    const layers = [
      { count: 1500, depth: -200, size: 4, speed: 0.3, name: 'far' },
      { count: 2000, depth: -100, size: 3, speed: 0.5, name: 'mid' },
      { count: 2500, depth: 0, size: 2, speed: 0.7, name: 'near' }
    ];

    const particleLayers = [];

    layers.forEach((layer, layerIndex) => {
      const positions = new Float32Array(layer.count * 3);
      const colors = new Float32Array(layer.count * 3);
      const sizes = new Float32Array(layer.count);
      const velocities = new Float32Array(layer.count * 3);
      const phases = new Float32Array(layer.count);

      for (let i = 0; i < layer.count; i++) {
        // Distribute particles in 3D space with depth
        const radius = 150 + (layerIndex * 50);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = layer.depth + (Math.random() - 0.5) * 50;

        // Color selection based on depth and randomness
        let color;
        const colorChoice = Math.random();
        const depthFactor = (layerIndex + 1) / layers.length;
        
        if (colorChoice < 0.25) {
          color = colorPalette.gold;
        } else if (colorChoice < 0.5) {
          color = colorPalette.maroon1;
        } else if (colorChoice < 0.75) {
          color = colorPalette.maroon2;
        } else {
          color = colorPalette.green;
        }

        // Dim colors for distant particles
        colors[i * 3] = color.r * depthFactor;
        colors[i * 3 + 1] = color.g * depthFactor;
        colors[i * 3 + 2] = color.b * depthFactor;

        // Variable sizes based on depth
        sizes[i] = layer.size * (0.5 + Math.random() * 1.5);

        // Orbital velocities
        velocities[i * 3] = (Math.random() - 0.5) * layer.speed * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * layer.speed * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * layer.speed * 0.01;

        // Phase for wave animations
        phases[i] = Math.random() * Math.PI * 2;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Enhanced material with depth-based transparency
      const material = new THREE.PointsMaterial({
        size: layer.size,
        vertexColors: true,
        transparent: true,
        opacity: 0.8 - (layerIndex * 0.2),
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
        depthTest: true
      });

      const particles = new THREE.Points(geometry, material);
      particles.userData = { 
        velocities, 
        phases,
        layer: layer.name,
        baseOpacity: 0.8 - (layerIndex * 0.2)
      };
      scene.add(particles);
      particleLayers.push(particles);
    });

    particleLayersRef.current = particleLayers;

    // Add connecting lines for neural network effect (only for nearest layer)
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Add ambient particles (glowing dots)
    const glowGeometry = new THREE.BufferGeometry();
    const glowCount = 100;
    const glowPositions = new Float32Array(glowCount * 3);
    const glowColors = new Float32Array(glowCount * 3);
    const glowSizes = new Float32Array(glowCount);

    for (let i = 0; i < glowCount; i++) {
      glowPositions[i * 3] = (Math.random() - 0.5) * 400;
      glowPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      glowPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const isGold = Math.random() > 0.5;
      glowColors[i * 3] = isGold ? 1 : 0.1;
      glowColors[i * 3 + 1] = isGold ? 0.75 : 0.73;
      glowColors[i * 3 + 2] = isGold ? 0.14 : 0.38;

      glowSizes[i] = 8 + Math.random() * 12;
    }

    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    glowGeometry.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
    glowGeometry.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));

    const glowMaterial = new THREE.PointsMaterial({
      size: 10,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    const glowParticles = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(glowParticles);

    // Mouse interaction with smooth easing
    const handleMouseMove = (event) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Touch support for mobile
    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseRef.current.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Animation variables
    let time = 0;
    const mouse = mouseRef.current;

    // Main animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clockRef.current.getDelta();
      time += delta;

      // Smooth mouse following with easing
      const easingFactor = 0.05;
      mouse.x += (mouse.targetX - mouse.x) * easingFactor;
      mouse.y += (mouse.targetY - mouse.y) * easingFactor;

      // Parallax camera movement based on mouse with depth
      camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 20 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Animate particle layers with depth-based speed
      particleLayersRef.current.forEach((particleSystem, layerIndex) => {
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.userData.velocities;
        const phases = particleSystem.userData.phases;
        const layerSpeed = 1 + layerIndex * 0.5;

        // Gentle rotation based on layer
        particleSystem.rotation.y += 0.0001 * layerSpeed;
        particleSystem.rotation.x += 0.00005 * layerSpeed;

        // Update particle positions with wave motion
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          
          // Orbital motion
          positions[i] += velocities[i] * layerSpeed;
          positions[i + 1] += velocities[i + 1] * layerSpeed;
          positions[i + 2] += velocities[i + 2] * layerSpeed;

          // Wave effect
          const waveAmplitude = 5;
          const waveFrequency = 0.5;
          positions[i + 2] += Math.sin(time * waveFrequency + phases[idx]) * waveAmplitude * delta;

          // Mouse interaction - particles react to mouse with depth
          const mouseInfluence = 1 - (layerIndex * 0.3);
          const dx = mouse.x * 100 - positions[i];
          const dy = mouse.y * 100 - positions[i + 1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            positions[i] -= dx * force * 0.1 * mouseInfluence;
            positions[i + 1] -= dy * force * 0.1 * mouseInfluence;
          }

          // Boundary wrapping with smooth transition
          const boundary = 250;
          if (Math.abs(positions[i]) > boundary) {
            velocities[i] *= -1;
            positions[i] = Math.sign(positions[i]) * boundary;
          }
          if (Math.abs(positions[i + 1]) > boundary) {
            velocities[i + 1] *= -1;
            positions[i + 1] = Math.sign(positions[i + 1]) * boundary;
          }
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Pulsing opacity effect
        const pulseSpeed = 0.5 + layerIndex * 0.2;
        const baseOpacity = particleSystem.userData.baseOpacity;
        particleSystem.material.opacity = baseOpacity + Math.sin(time * pulseSpeed) * 0.1;
      });

      // Animate glow particles
      glowParticles.rotation.y += 0.0002;
      glowParticles.rotation.x += 0.0001;
      
      const glowPositions = glowParticles.geometry.attributes.position.array;
      for (let i = 0; i < glowPositions.length; i += 3) {
        glowPositions[i + 2] += Math.sin(time + i) * 0.05;
      }
      glowParticles.geometry.attributes.position.needsUpdate = true;

      // Update neural network connections
      const nearestLayer = particleLayersRef.current[2];
      if (nearestLayer) {
        const positions = nearestLayer.geometry.attributes.position.array;
        const linePositions = [];
        const maxDistance = 30;
        const maxConnections = 150;
        let connectionCount = 0;

        // Sample particles for connections (performance optimization)
        for (let i = 0; i < positions.length && connectionCount < maxConnections; i += 15) {
          for (let j = i + 15; j < positions.length && connectionCount < maxConnections; j += 15) {
            const dx = positions[i] - positions[j];
            const dy = positions[i + 1] - positions[j + 1];
            const dz = positions[i + 2] - positions[j + 2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < maxDistance) {
              linePositions.push(
                positions[i], positions[i + 1], positions[i + 2],
                positions[j], positions[j + 1], positions[j + 2]
              );
              connectionCount++;
            }
          }
        }

        if (linePositions.length > 0) {
          lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          // Pulsing line opacity
          lines.material.opacity = 0.1 + Math.sin(time * 0.8) * 0.05;
        }
      }

      // Camera subtle breathing effect
      camera.position.z = 100 + Math.sin(time * 0.3) * 5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize with smooth transition
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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

      // Dispose geometries and materials
      particleLayers.forEach(layer => {
        layer.geometry.dispose();
        layer.material.dispose();
      });

      if (lines) {
        lines.geometry.dispose();
        lines.material.dispose();
      }

      if (glowParticles) {
        glowParticles.geometry.dispose();
        glowParticles.material.dispose();
      }

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
        pointerEvents: 'none',
        background: 'radial-gradient(circle at center, rgba(114, 47, 55, 0.3) 0%, rgba(0, 0, 0, 1) 100%)',
      }}
    />
  );
}