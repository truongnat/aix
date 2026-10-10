# 3D Performance Optimization

## Profiling first

Before optimizing, measure:

```javascript
// Draw calls — main bottleneck on mobile
console.log(renderer.info.render.calls);        // target < 100 mobile, < 500 desktop

// Triangle count
console.log(renderer.info.render.triangles);    // target < 500K mobile

// GPU memory
console.log(renderer.info.memory.geometries);   // geometry count
console.log(renderer.info.memory.textures);     // texture count

// FPS
let last = performance.now();
function animate() {
  const now = performance.now();
  const fps = 1000 / (now - last);
  last = now;
  // log or display fps
  requestAnimationFrame(animate);
}
```

## Draw call reduction

### InstancedMesh (most impactful)

```javascript
// Bad: 1000 trees = 1000 draw calls
trees.forEach(pos => {
  const mesh = new THREE.Mesh(treeGeo, treeMat);
  mesh.position.copy(pos);
  scene.add(mesh);
});

// Good: 1000 trees = 1 draw call
const instanced = new THREE.InstancedMesh(treeGeo, treeMat, 1000);
const matrix = new THREE.Matrix4();
trees.forEach((pos, i) => {
  matrix.setPosition(pos);
  instanced.setMatrixAt(i, matrix);
});
instanced.instanceMatrix.needsUpdate = true;
scene.add(instanced);
```

### Geometry merging (static scene objects)

```javascript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const merged = mergeGeometries([geo1, geo2, geo3], false);
const singleMesh = new THREE.Mesh(merged, material);
scene.add(singleMesh);
```

## Texture optimization

```javascript
// KTX2/Basis compression (requires KTX2Loader)
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
const loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
const texture = await loader.loadAsync('texture.ktx2');

// Anisotropy (improves quality at angles, small perf cost)
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Mipmaps (auto-generated, prevents aliasing)
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;

// Power-of-two dimensions (required for mipmaps)
// Use 512x512, 1024x1024, 2048x2048 — never 600x400
```

## GLTF optimization pipeline

```bash
# Install gltf-transform
npm install -g @gltf-transform/cli

# Full optimization pipeline
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024

# Check result
gltf-transform inspect output.glb
```

## Level of Detail (LOD)

```javascript
import { LOD } from 'three';

const lod = new LOD();

// High detail: 0–20 units from camera
lod.addLevel(new THREE.Mesh(highPolyGeo, mat), 0);

// Medium detail: 20–80 units
lod.addLevel(new THREE.Mesh(midPolyGeo, mat), 20);

// Low detail / billboard: 80+ units
lod.addLevel(new THREE.Mesh(lowPolyGeo, mat), 80);

// Hidden (culled): 200+ units
lod.addLevel(new THREE.Mesh(new THREE.BufferGeometry(), mat), 200);

scene.add(lod);
```

## Render optimization

```javascript
// Only re-render when something changes (static scenes)
renderer.setAnimationLoop(null); // disable auto-render
scene.addEventListener('change', () => renderer.render(scene, camera));

// Frustum culling (enabled by default, verify it's on)
object.frustumCulled = true;

// Renderer settings for mobile
renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio === 1, // skip AA on HiDPI (already has natural AA)
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap at 2x
```

## Shader optimization

```glsl
// Prefer mediump on mobile fragment shaders
precision mediump float;

// Avoid branching in shaders (use step/mix/clamp instead)
// Bad:
float val = condition ? a : b;

// Good:
float val = mix(b, a, step(0.5, condition));

// Avoid discard (breaks early-z optimization, especially on mobile)
// Only use when alpha-testing is absolutely required
```

## Memory management

```javascript
// Dispose on removal
function removeObject(object) {
  scene.remove(object);
  object.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => {
          Object.values(m).forEach(v => v?.isTexture && v.dispose());
          m.dispose();
        });
      } else {
        Object.values(child.material).forEach(v => v?.isTexture && v.dispose());
        child.material.dispose();
      }
    }
  });
}
```

## Mobile-specific targets

| Metric | Mobile target | Desktop target |
|--------|--------------|----------------|
| Draw calls | < 100 | < 500 |
| Triangles | < 300K | < 2M |
| Texture memory | < 100MB | < 500MB |
| FPS | ≥ 30 | ≥ 60 |
| GLB size | < 2MB | < 10MB |
