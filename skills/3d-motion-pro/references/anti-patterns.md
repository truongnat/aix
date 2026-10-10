# 3D Motion Anti-patterns

## 1. Not disposing geometry, materials, and textures

**Symptom**: Memory usage grows over time; GPU memory leaks on page navigation.
**Fix**: Always call `geometry.dispose()`, `material.dispose()`, `texture.dispose()` when removing objects or unmounting a component. In React Three Fiber, use `useEffect` cleanup.

```javascript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}, []);
```

## 2. Too many draw calls

**Symptom**: Scene with 500 identical trees renders at 8fps on mobile.
**Fix**: Use `InstancedMesh` for repeated geometry. One draw call renders all instances.

```javascript
// Bad: 500 separate Mesh objects = 500 draw calls
// Good: one InstancedMesh = 1 draw call
const mesh = new THREE.InstancedMesh(geometry, material, 500);
```

## 3. Shipping uncompressed GLTF files

**Symptom**: 45MB `.gltf` with embedded textures causes 15s load times.
**Fix**: Always run `gltf-transform optimize` with Draco/Meshopt compression and WebP/KTX2 textures before shipping. Target < 2MB for most scenes.

## 4. Updating geometry vertices every frame

**Symptom**: Custom shader effect implemented by mutating `geometry.attributes.position` in the animation loop — causes a GPU upload every frame.
**Fix**: Use `ShaderMaterial` with `uniforms` for time-based effects. GPU-side computation via GLSL is orders of magnitude faster.

## 5. Missing fallback for no-WebGL

**Symptom**: The page shows a blank canvas on Safari iOS 12 or older devices.
**Fix**: Check `renderer.capabilities.isWebGL2` or catch WebGL context errors. Show a static image fallback.

```javascript
try {
  renderer = new THREE.WebGLRenderer({ canvas });
} catch (e) {
  showFallbackImage();
}
```

## 6. Running physics on the main thread

**Symptom**: Ammo.js physics simulation blocks the UI thread; input lag of 200ms+.
**Fix**: Move physics to a Web Worker. Use `Rapier` (WASM, worker-compatible) over Ammo.js for new projects.

## 7. Not using LOD (Level of Detail)

**Symptom**: High-poly 1M triangle model renders at full detail even when it's 10px on screen.
**Fix**: Use Three.js `LOD` to swap lower-detail meshes at distance thresholds.

## 8. Animating with `setInterval` or `setTimeout`

**Symptom**: Animation stutter, especially when the browser tab is backgrounded.
**Fix**: Always use `requestAnimationFrame` (or Three.js's built-in render loop). R3F's `useFrame` handles this automatically.

## 9. Loading textures synchronously inside the render loop

**Symptom**: `TextureLoader.load()` called inside `animate()` — reloads the texture every frame.
**Fix**: Load textures once outside the loop and reuse the reference.

## 10. Ignoring `pixelRatio` on high-DPI displays

**Symptom**: Scene looks blurry on Retina/HiDPI screens.
**Fix**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2 to avoid rendering 9x pixels on 3x displays.
