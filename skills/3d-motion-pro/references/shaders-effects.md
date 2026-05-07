# Shaders and Post-processing Effects

## ShaderMaterial basics

```javascript
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color(0x00aaff) },
  },
  vertexShader: /* glsl */`
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;
      // Wave animation
      float elevation = sin(pos.x * 4.0 + uTime) * 0.1
                      + sin(pos.z * 4.0 + uTime * 0.8) * 0.1;
      pos.y += elevation;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      float alpha = (vElevation + 0.1) * 5.0;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  transparent: true,
});

// Update time uniform in animation loop
material.uniforms.uTime.value = clock.getElapsedTime();
```

## Particle systems

```javascript
const count = 5000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  colors[i * 3]     = Math.random();
  colors[i * 3 + 1] = Math.random();
  colors[i * 3 + 2] = Math.random();
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.02,
  vertexColors: true,
  sizeAttenuation: true,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
```

## Post-processing pipeline

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const composer = new EffectComposer(renderer);

// 1. Render the scene
composer.addPass(new RenderPass(scene, camera));

// 2. Bloom (glow)
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloom);

// 3. SSAO (ambient occlusion)
composer.addPass(new SSAOPass(scene, camera, width, height));

// 4. Anti-aliasing (FXAA)
const fxaa = new ShaderPass(FXAAShader);
fxaa.uniforms.resolution.value.set(1 / width, 1 / height);
composer.addPass(fxaa);

// In render loop — use composer instead of renderer
function animate() {
  requestAnimationFrame(animate);
  composer.render(); // not renderer.render()
}
```

## GLSL utility functions

```glsl
// Remap a value from one range to another
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Smooth minimum (blend between two values)
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Rotation matrix 2D
mat2 rotate2D(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

// Noise (simple value noise)
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453123);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453123);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453123);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453123);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
```

## React Three Fiber (R3F) shaders

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(0.2, 0.5, 1.0) },
  // vertex shader
  `uniform float uTime; varying vec2 vUv;
   void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  // fragment shader
  `uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
   void main() { gl_FragColor = vec4(uColor * (0.5 + 0.5 * sin(vUv.x * 10.0 + uTime)), 1.0); }`
);
extend({ WaveMaterial });

function WaveMesh() {
  const mat = useRef();
  useFrame(({ clock }) => { mat.current.uTime = clock.getElapsedTime(); });
  return (
    <mesh>
      <planeGeometry args={[2, 2, 64, 64]} />
      <waveMaterial ref={mat} />
    </mesh>
  );
}
```
