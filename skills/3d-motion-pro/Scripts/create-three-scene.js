#!/usr/bin/env node
/**
 * Create a basic Three.js scene with common elements
 * Usage: node create-three-scene.js [options]
 * Options:
 *   --output <path>      Output HTML file path (default: ./scene.html)
 *   --type <type>        Scene type (basic, particles, animation)
 */

const fs = require('fs');
const path = require('path');

function generateSceneHTML(type = 'basic') {
  let sceneCode = '';
  
  if (type === 'basic') {
    sceneCode = `
// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
`;
  } else if (type === 'particles') {
    sceneCode = `
// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create particles
const particleCount = 1000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ 
  size: 0.5, 
  color: 0x00ff00 
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

camera.position.z = 50;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.001;
  renderer.render(scene, camera);
}
animate();
`;
  } else if (type === 'animation') {
    sceneCode = `
import gsap from 'gsap';

// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Animate with GSAP
gsap.to(cube.rotation, {
  y: Math.PI * 2,
  duration: 3,
  repeat: -1,
  ease: 'none'
});

gsap.to(cube.scale, {
  x: 1.5,
  y: 1.5,
  z: 1.5,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: 'power2.inOut'
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
`;
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Three.js ${type} Scene</title>
  <style>
    body { margin: 0; overflow: hidden; }
  </style>
</head>
<body>
  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';
    ${type === 'animation' ? "import gsap from 'https://unpkg.com/gsap@3.12.2/index.js';" : ''}
    
    ${sceneCode}
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;
}

// Parse command line arguments
const args = process.argv.slice(2);
let outputPath = './scene.html';
let sceneType = 'basic';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  } else if (args[i] === '--type' && args[i + 1]) {
    sceneType = args[i + 1];
    i++;
  }
}

try {
  const html = generateSceneHTML(sceneType);
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Three.js ${sceneType} scene created: ${outputPath}`);
  console.log(`\nTo run:`);
  console.log(`  1. Start a local server: npx serve`);
  console.log(`  2. Open in browser: http://localhost:3000`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
