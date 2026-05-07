---
name: 3d-motion-pro
description: Use this skill whenever the user wants to work with 3D objects, motion graphics, animation, or interactive 3D experiences. This includes creating 3D models, motion graphics, animations, interactive 3D web experiences, AR/VR content, 3D UI components, and animated visualizations. If the user mentions 3D design, motion graphics, animation, Three.js, Blender, or AR/VR, use this skill.
license: MIT
metadata:
  short-description: "3D Motion — 3D models, motion graphics, animation, Three.js, AR/VR"
---

## Boundary

This skill handles 3D design and motion graphics tasks including 3D modeling, motion graphics, animations, interactive 3D web experiences, AR/VR content, 3D UI components, and animated visualizations. It focuses on using 3D tools (Three.js, Blender, Maya, Cinema 4D, Spline, Framer Motion) and animation libraries. It does NOT cover 2D graphic design, static UI design, or traditional web development.

## When to use

Use this skill when:
- Creating 3D models and assets
- Building motion graphics and animations
- Developing interactive 3D web experiences
- Implementing AR/VR content
- Creating 3D UI components and interfaces
- Building animated visualizations
- Working with 3D libraries (Three.js, WebGL, Babylon.js)
- Using 3D modeling tools (Blender, Maya, Cinema 4D)
- Creating particle effects and shaders
- Implementing physics simulations in 3D

DO NOT use this skill for:
- 2D graphic design (use design-system-pro)
- Static UI design (use ui-design-brain-pro)
- Traditional web development (use react-pro, nextjs-pro)
- Basic animations (use motion-design-pro)

## Workflow

1. **Identify the 3D/motion task** (modeling, animation, web 3D, AR/VR)
2. **Select appropriate tools** (Three.js, Blender, Maya, Spline, Framer Motion)
3. **Create or import 3D assets** (models, textures, materials)
4. **Implement animations** using keyframes or procedural animation
5. **Optimize for performance** (LOD, compression, culling)
6. **Add interactivity** (user input, physics, collision detection)
7. **Test across devices** (desktop, mobile, VR headsets)
8. **Export and integrate** with target platform

### Operating principles

- **Optimize for performance** (use LOD, compression, efficient rendering)
- **Maintain consistent frame rates** (60fps for web, 90fps for VR)
- **Use appropriate file formats** (GLTF/GLB for web, FBX for modeling)
- **Test across devices** and performance levels
- **Implement smooth animations** with proper easing
- **Handle loading states** for 3D assets
- **Provide fallbacks** for devices without 3D support
- **Consider accessibility** in 3D interactions

## Suggested response format

```
3D Motion Task: [modeling / animation / web 3D / AR/VR]
Tools Used: [Three.js / Blender / Maya / Spline / Framer Motion]
Assets Created: [3D models, animations, textures]
Performance: [frame rate, load time, optimization techniques]
Interactivity: [user interactions, physics, collision detection]
Device Support: [desktop, mobile, VR headsets]
Export Format: [GLTF/GLB, FBX, USDZ]
Integration: [how to integrate with target platform]
```

## Resources in this skill

- **3D Libraries**: Three.js, WebGL, Babylon.js, React Three Fiber
- **Modeling Tools**: Blender, Maya, Cinema 4D, Spline
- **Animation Tools**: Framer Motion, GSAP, Blender Animation
- **AR/VR Tools**: A-Frame, WebXR, AR.js, React 360
- **Reference Documentation**: REFERENCE.md for advanced 3D techniques

## Quick example

**Create 3D web experience with Three.js:**

```
1. Set up Three.js scene, camera, renderer
2. Add 3D objects (geometry, materials, lights)
3. Implement animations (rotation, position, scale)
4. Add interactivity (mouse events, keyboard controls)
5. Optimize for performance (geometry compression, texture optimization)
6. Handle window resize and device orientation
7. Test across browsers and devices
```

## Checklist before calling the skill done

- [ ] 3D/motion task is clearly defined
- [ ] Appropriate tools are selected
- [ ] Performance requirements are understood
- [ ] Device support requirements are known
- [ ] 3D assets are available or can be created
- [ ] Animation requirements are specified
- [ ] Export format is determined
- [ ] Integration workflow is defined

---

# 3D Motion Design Guide

## Overview

This guide covers essential 3D design and motion graphics techniques using 3D libraries and tools. For advanced 3D techniques and real-world examples, see REFERENCE.md.

## Quick Start

```javascript
import * as THREE from 'three';

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

// Animate
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

## Three.js Basics

### Scene Setup
```javascript
import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
```

### Lighting
```javascript
// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);
```

### Materials
```javascript
// Basic material
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Lambert material (responds to light)
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

// Phong material (shiny)
const phongMaterial = new THREE.MeshPhongMaterial({ 
  color: 0x00ff00,
  shininess: 100 
});

// Standard material (physically based)
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  metalness: 0.5,
  roughness: 0.5
});
```

## Animation

### Basic Animation
```javascript
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate object
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}
animate();
```

### GSAP Animation
```javascript
import gsap from 'gsap';

// Animate position
gsap.to(cube.position, {
  x: 2,
  duration: 1,
  ease: 'power2.inOut'
});

// Animate rotation
gsap.to(cube.rotation, {
  y: Math.PI * 2,
  duration: 2,
  repeat: -1,
  ease: 'none'
});
```

### Framer Motion (React)
```javascript
import { motion } from 'framer-motion';

<motion.div
  animate={{ x: 100, opacity: 1 }}
  transition={{ duration: 1 }}
/>
```

## 3D Models

### Loading GLTF Models
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error(error);
});
```

### Creating Primitives
```javascript
// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const box = new THREE.Mesh(boxGeometry, material);

// Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, material);

// Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
const cylinder = new THREE.Mesh(cylinderGeometry, material);
```

## Interactivity

### Mouse Interaction
```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  
  if (intersects.length > 0) {
    const object = intersects[0].object;
    object.material.color.set(0xff0000);
  }
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);
```

### Keyboard Controls
```javascript
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function handleKeyboard() {
  if (keys['w']) camera.position.z -= 0.1;
  if (keys['s']) camera.position.z += 0.1;
  if (keys['a']) camera.position.x -= 0.1;
  if (keys['d']) camera.position.x += 0.1;
}
```

## Performance Optimization

### Geometry Compression
```javascript
// Use indexed geometry
const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);

// Merge geometries
const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries([
  geometry1,
  geometry2
]);
```

### Texture Optimization
```javascript
// Compress textures
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg');
texture.encoding = THREE.sRGBEncoding;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

### Level of Detail (LOD)
```javascript
import { LOD } from 'three';

const lod = new LOD();

// High detail
const highDetail = new THREE.Mesh(geometryHigh, material);
lod.addLevel(highDetail, 0);

// Medium detail
const mediumDetail = new THREE.Mesh(geometryMedium, material);
lod.addLevel(mediumDetail, 50);

// Low detail
const lowDetail = new THREE.Mesh(geometryLow, material);
lod.addLevel(lowDetail, 100);

scene.add(lod);
```

## AR/VR

### WebXR (VR)
```javascript
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

function onXRSessionStart() {
  // VR session started
}

renderer.xr.addEventListener('sessionstart', onXRSessionStart);
```

### AR.js (AR)
```javascript
import * as AR from 'ar.js';

const arToolkitSource = new AR.ArToolkitSource({
  sourceType: 'webcam'
});

arToolkitSource.init(() => {
  setTimeout(() => {
    onResize();
  }, 2000);
});

const arToolkitContext = new AR.ArToolkitContext({
  cameraParametersUrl: 'camera_para.dat',
  detectionMode: 'mono'
});
```

## Quick Reference

| Task | Best Tool | Key Feature |
|------|-----------|-------------|
| Web 3D | Three.js | WebGL abstraction |
| Modeling | Blender | Open-source, powerful |
| Animation | Framer Motion | React animations |
| VR | WebXR | Browser-based VR |
| AR | AR.js | Web-based AR |
| Motion Graphics | GSAP | Powerful animation |

## Next Steps

- For advanced 3D techniques, see REFERENCE.md
- For 3D modeling, explore Blender documentation
- For WebXR, consult WebXR API documentation
