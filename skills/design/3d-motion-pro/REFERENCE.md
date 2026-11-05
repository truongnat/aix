# 3D Motion Design Reference

## Advanced 3D and Motion Graphics Techniques

This reference provides advanced techniques and real-world examples for 3D design and motion graphics.

## Table of Contents

1. [Three.js Advanced Patterns](#threejs-advanced-patterns)
2. [Motion Graphics Techniques](#motion-graphics-techniques)
3. [Performance Optimization](#performance-optimization)
4. [AR/VR Implementation](#arvr-implementation)
5. [Real-World Examples](#real-world-examples)

## Three.js Advanced Patterns

### Custom Shaders

```javascript
// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    float dist = distance(vUv, vec2(0.5));
    float wave = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
    vec3 finalColor = color * wave;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Shader material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x00ff00) }
  }
});

// Update uniforms in animation loop
function animate() {
  material.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}
```

### Post-Processing Effects

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';

// Setup composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom effect
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// Film grain effect
const filmPass = new FilmPass(
  0.35,  // noise intensity
  0.025, // scanline intensity
  648,   // scanline count
  false  // grayscale
);
composer.addPass(filmPass);

// Use composer instead of renderer
function animate() {
  composer.render();
}
```

### Particle Systems

```javascript
// Particle geometry
const particleCount = 10000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  
  colors[i * 3] = Math.random();
  colors[i * 3 + 1] = Math.random();
  colors[i * 3 + 2] = Math.random();
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.5,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Animate particles
function animate() {
  const positions = particles.geometry.attributes.position.array;
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += 0.1;
    
    if (positions[i * 3 + 1] > 50) {
      positions[i * 3 + 1] = -50;
    }
  }
  
  particles.geometry.attributes.position.needsUpdate = true;
}
```

### Physics Simulation

```javascript
// Simple physics simulation
class PhysicsObject {
  constructor(mesh, mass = 1) {
    this.mesh = mesh;
    this.mass = mass;
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.position = mesh.position.clone();
  }
  
  applyForce(force) {
    const f = force.clone().divideScalar(this.mass);
    this.acceleration.add(f);
  }
  
  update(deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.mesh.position.copy(this.position);
    this.acceleration.set(0, 0, 0);
  }
}

// Gravity simulation
const gravity = new THREE.Vector3(0, -9.81, 0);

function simulatePhysics(objects, deltaTime) {
  objects.forEach(obj => {
    obj.applyForce(gravity.clone().multiplyScalar(obj.mass));
    obj.update(deltaTime);
  });
}
```

## Motion Graphics Techniques

### GSAP Animation

```javascript
import gsap from 'gsap';

// Animate camera
gsap.to(camera.position, {
  x: 10,
  y: 5,
  z: 20,
  duration: 2,
  ease: 'power2.inOut'
});

// Animate object rotation
gsap.to(cube.rotation, {
  y: Math.PI * 2,
  duration: 3,
  repeat: -1,
  ease: 'none'
});

// Timeline for sequenced animations
const timeline = gsap.timeline();

timeline
  .to(cube.scale, { x: 2, y: 2, z: 2, duration: 1 })
  .to(cube.position, { y: 5, duration: 1 })
  .to(cube.rotation, { x: Math.PI, duration: 1 });
```

### Morphing Animations

```javascript
// Morph between shapes
function morphGeometry(geometry1, geometry2, progress) {
  const positions1 = geometry1.attributes.position.array;
  const positions2 = geometry2.attributes.position.array;
  
  for (let i = 0; i < positions1.length; i++) {
    positions1[i] = THREE.MathUtils.lerp(positions1[i], positions2[i], progress);
  }
  
  geometry1.attributes.position.needsUpdate = true;
}

// Animate morph
let progress = 0;
function animateMorph() {
  progress += 0.01;
  if (progress > 1) progress = 0;
  
  morphGeometry(sphereGeometry, boxGeometry, progress);
}
```

### Procedural Animation

```javascript
// Procedural animation based on math functions
function proceduralAnimation(time) {
  const x = Math.sin(time) * 5;
  const y = Math.cos(time * 0.5) * 3;
  const z = Math.sin(time * 0.3) * 2;
  
  return new THREE.Vector3(x, y, z);
}

// Apply to object
function animate() {
  const time = Date.now() * 0.001;
  const position = proceduralAnimation(time);
  object.position.copy(position);
}
```

## Performance Optimization

### Geometry Instancing

```javascript
// Instanced mesh for many identical objects
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

const dummy = new THREE.Object3D();

for (let i = 0; i < 1000; i++) {
  dummy.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  dummy.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}

scene.add(instancedMesh);
```

### Texture Compression

```javascript
// Compress textures using KTX2 format
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const ktx2Loader = new KTX2Loader();
ktx2Loader.setDecoderPath('https://unpkg.com/three@0.150.0/examples/jsm/libs/');
ktx2Loader.setDecoderOptions({ format: THREE.RGBA_ASTC_4x4 });

ktx2Loader.load('texture.ktx2', (texture) => {
  material.map = texture;
  material.needsUpdate = true;
});
```

### Dynamic Loading

```javascript
// Load assets dynamically
async function loadAssets() {
  const loader = new THREE.GLTFLoader();
  
  try {
    const gltf = await loader.loadAsyncAsync('model.glb');
    scene.add(gltf.scene);
  } catch (error) {
    console.error('Error loading asset:', error);
  }
}

// Progressive loading
function loadProgressively(urls) {
  let loaded = 0;
  
  urls.forEach(url => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      loaded++;
      const progress = (loaded / urls.length) * 100;
      console.log(`Loading progress: ${progress}%`);
    });
  });
}
```

## AR/VR Implementation

### WebXR VR Experience

```javascript
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// Enable VR
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

// VR session start
renderer.xr.addEventListener('sessionstart', (event) => {
  console.log('VR session started');
  
  // Set up VR-specific controls
  const session = event.target;
  session.addEventListener('selectstart', onSelectStart);
  session.addEventListener('selectend', onSelectEnd);
});

// Controller interaction
const controller = renderer.xr.getController(0);
controller.addEventListener('selectstart', onSelectStart);
controller.addEventListener('selectend', onSelectEnd);
scene.add(controller);

// Controller model
const controllerModelFactory = new XRControllerModelFactory();
controllerModelFactory.createControllerModel(controller);
```

### AR with WebXR

```javascript
// Enable AR
renderer.xr.enabled = true;
renderer.setReferenceSpaceType('local');

// AR session
renderer.xr.addEventListener('sessionstart', (event) => {
  const session = event.target;
  
  // Set up hit testing
  session.addEventListener('select', onSelect);
});

// Hit testing
async function onSelect(event) {
  const session = event.target.session;
  const frame = event.frame;
  
  const hitTestSource = await session.requestHitTestSource({
    space: event.frame.viewerSpace,
    hitTest: {
      raySpace: event.frame.viewerSpace
    }
  });
  
  const hitTestResults = await frame.getHitTestResults(hitTestSource);
  
  if (hitTestResults.length > 0) {
    const hit = hitTestResults[0];
    // Place object at hit location
    placeObjectAtHit(hit);
  }
}
```

### AR.js (Marker-based AR)

```javascript
import * as AR from 'ar.js';

// Setup AR.js
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

arToolkitContext.init(() => {
  cameraProjection.copy(arToolkitContext.getCameraMatrix());
});

// Create marker
const markerGroup = new THREE.Group();
scene.add(markerGroup);

const markerControls = new AR.ArMarkerControls(
  arToolkitContext,
  markerGroup,
  { type: 'pattern', patternUrl: 'pattern.patt' }
);
```

## Real-World Examples

### Case Study: Interactive Product Showcase

```javascript
class ProductShowcase {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.setupScene();
    this.loadProduct();
    this.setupInteractions();
    this.animate();
  }
  
  setupScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    
    this.camera.position.z = 5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }
  
  loadProduct() {
    const loader = new THREE.GLTFLoader();
    loader.load('product.glb', (gltf) => {
      this.product = gltf.scene;
      this.scene.add(this.product);
      
      // Center product
      const box = new THREE.Box3().setFromObject(this.product);
      const center = box.getCenter(new THREE.Vector3());
      this.product.position.sub(center);
    });
  }
  
  setupInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    window.addEventListener('click', () => {
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.product.children);
      
      if (intersects.length > 0) {
        // Rotate product on click
        gsap.to(this.product.rotation, {
          y: this.product.rotation.y + Math.PI * 2,
          duration: 1,
          ease: 'power2.inOut'
        });
      }
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Idle animation
    if (this.product) {
      this.product.rotation.y += 0.005;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
```

### Case Study: Data Visualization in 3D

```javascript
class DataVisualization {
  constructor(data) {
    this.data = data;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.setupScene();
    this.createVisualization();
    this.setupControls();
    this.animate();
  }
  
  createVisualization() {
    // Create 3D bar chart
    const barWidth = 1;
    const barSpacing = 0.5;
    
    this.data.forEach((value, index) => {
      const height = value / 10;
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color().setHSL(index / this.data.length, 0.7, 0.5)
      });
      const bar = new THREE.Mesh(geometry, material);
      
      bar.position.x = (index - this.data.length / 2) * (barWidth + barSpacing);
      bar.position.y = height / 2;
      
      this.scene.add(bar);
      
      // Add animation
      gsap.from(bar.scale, {
        y: 0,
        duration: 1,
        delay: index * 0.1,
        ease: 'power2.out'
      });
    });
  }
  
  setupControls() {
    // OrbitControls for camera
    const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    this.controls = controls;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
```

## Resources

### Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [WebXR API](https://www.w3.org/TR/webxr/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Blender Documentation](https://docs.blender.org/manual/)

### Tools
- [Spline](https://spline.design/) - 3D design tool
- [Figma](https://www.figma.com/) - Design with 3D capabilities
- [Blender](https://www.blender.org/) - 3D modeling
- [Maya](https://www.autodesk.com/products/maya/) - Professional 3D

### Communities
- [Three.js Discord](https://discord.gg/56GBJx)
- [WebXR Slack](https://immersiveweb slack)
- [Blender Artists](https://blenderartists.org/)
