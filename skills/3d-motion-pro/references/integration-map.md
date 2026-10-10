# 3D Motion Integration Map

## Skill handoffs

```
3d-motion-pro
├── → motion-design-pro
│     When: 3D scene needs 2D UI overlay animations (GSAP DOM animations, Framer Motion)
│     Handoff: Canvas element; 2D animation spec
│
├── → react-pro
│     When: Using React Three Fiber (R3F); component architecture for 3D
│     Handoff: R3F component tree; useFrame/useThree hook patterns
│
├── → performance-tuning-pro
│     When: FPS below target; memory usage growing; unexplained jank
│     Handoff: renderer.info profiling data; flame chart from Chrome DevTools
│
├── → ai-design-pro
│     When: AI-generated textures, normal maps, or reference images feed into 3D scene
│     Handoff: Generated image assets; UV-unwrap requirements
│
└── → frontend-design-pro
      When: 3D canvas is embedded within a larger page layout
      Handoff: Canvas dimensions, z-index handling, responsive behaviour spec
```

## Framework integration

### Three.js (vanilla)

```javascript
// Minimal Three.js scene setup
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 5);
```

### React Three Fiber

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense } from 'react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <Suspense fallback={null}>
        <Model url="/model.glb" />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
```

### WebXR VR

```javascript
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

// VR render loop
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera); // camera auto-managed by WebXR
});
```

## Asset pipeline

```
Blender / Maya / Cinema 4D
  ↓ Export as GLTF/GLB
gltf-transform optimize (Draco + WebP textures)
  ↓ Compressed GLB < 2MB
CDN (Cloudflare R2 / AWS S3 + CloudFront)
  ↓ Cache-Control: max-age=31536000
Three.js GLTFLoader / R3F useGLTF
  ↓ Loaded in browser
scene.add(gltf.scene)
```

## Build tooling

```javascript
// vite.config.js — handle GLTF as assets
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr', '**/*.ktx2'],
};

// webpack.config.js
module.exports = {
  module: {
    rules: [
      { test: /\.(gltf|glb|hdr|ktx2)$/, type: 'asset/resource' }
    ]
  }
};
```
