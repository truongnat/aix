# 3D Motion Decision Tree

## Step 1 — What is the use case?

```
Use case?
├── Interactive 3D viewer / product showcase   → Step 2: Web 3D
├── 3D elements inside a React app             → Step 2: React 3D
├── VR / immersive experience                  → Step 3: WebXR VR
├── AR on mobile                               → Step 3: WebXR AR
└── Motion graphics / animation only           → Step 4: Animation
```

## Step 2 — Web 3D library

```
React app?
├── Yes → React Three Fiber (R3F) + Drei
│         → Familiar React patterns, hooks, declarative scene graph
└── No  →
    Need visual scripting / no-code?
    ├── Yes → Spline (exports to React/HTML embed)
    └── No  →
        Need advanced physics / enterprise features?
        ├── Yes → Babylon.js (better docs for physics, WebXR)
        └── No  → Three.js (largest community, most examples)
```

## Step 3 — WebXR

```
VR or AR?
├── VR →
│   Target device?
│   ├── Meta Quest browser → Three.js + WebXR + VRButton
│   ├── Desktop browser    → Three.js + WebXR (PCVR fallback)
│   └── React app          → R3F + @react-three/xr
└── AR →
    Permission requirements?
    ├── No camera permissions needed → AR.js (marker-based)
    └── Camera OK (mobile Safari/Chrome) →
        Location?
        ├── Marker-based  → AR.js or MindAR
        └── World-space   → WebXR hit-testing API
```

## Step 4 — Animation

```
3D animation type?
├── Object transform (position/rotation/scale) → GSAP + Three.js object properties
├── Skeletal / morph target animation          → Three.js AnimationMixer + GLTFLoader
├── Camera path animation                      → GSAP + CameraHelper
├── 2D overlay on 3D scene                     → Framer Motion (DOM layer above canvas)
└── Procedural / shader-based                  → ShaderMaterial uniforms + clock
```

## Step 5 — Asset format

```
Source asset?
├── Blender / Maya / Cinema 4D → Export to GLB (single binary file)
├── Sketch / Figma 3D           → Export to GLTF then convert to GLB
├── Photogrammetry              → GLB + Draco compression (complex geo)
└── Procedural (code only)      → Three.js BufferGeometry (no file needed)

Optimization needed?
├── Yes (always for production) →
│   npm install -g @gltf-transform/cli
│   gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
└── No (prototype only) → Use raw GLB from export
```

## Step 6 — Performance strategy

```
Target device?
├── Desktop only →
│   Draw calls < 500; triangles < 2M; 60fps target
├── Mobile web →
│   Draw calls < 100; triangles < 300K; 30fps minimum
│   → Use InstancedMesh, LOD, compressed textures
└── VR (Quest 2) →
│   Draw calls < 100; 72fps target; no post-processing
│   → Instancing mandatory; FXAA instead of MSAA
└── All devices →
    → Test on iPhone 12 or equivalent mid-range Android
    → Profile with renderer.info.render.calls before optimizing
```
