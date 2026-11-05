# visionOS Human Interface Guidelines — Spatial UI Design

## Spaces: Shared Space vs Full Space

visionOS apps run in one of two space configurations. Choosing wrong creates user friction or capability gaps.

**Shared Space:**
- Default mode; the user's environment (their room) remains visible
- Other apps can run simultaneously, their windows coexisting with yours
- Windows, volumes, and ornaments are allowed
- Best for: productivity apps, utilities, communication, reference content
- Transition in: the app launches into Shared Space by default

**Full Space (Immersive Space):**
- Hides all other apps and the user's environment (partially or fully)
- Required for: immersive experiences, spatial games, 3D visualization, cinematic video
- Two levels:
  - `.mixed` (progressive): partial immersion — real world dimmed, your content overlaid
  - `.full`: complete visual isolation — custom skybox, no passthrough
- User must explicitly enter Full Space; never force it on launch
- Provide a clear way to exit back to Shared Space

**Code:**
```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }          // Shared Space window
        ImmersiveSpace(id: "theater") {        // Full Space scene
            TheaterView()
        }
    }
}
```

**Transition cost:** entering Full Space takes ~1 second; exiting returns instantly. Don't toggle it unnecessarily.

---

## Windows: Glass-Morphism Panels

visionOS windows are floating glass panels — not opaque rectangles. They sit in 3D space, with subtle refraction and environment reflections.

**Material:** `.glass` — the only appropriate window background. Never use opaque fills for window backgrounds; they look wrong in the environment.

**Window sizing:**
- Default: system chooses a reasonable starting size
- Minimum/maximum: set with `.frame(minWidth:idealWidth:maxWidth:)` on the scene
- Users resize windows by grabbing the bottom edge handle — support all sizes your layout allows

**Depth placement:**
- Windows open at a comfortable default distance (~2 meters)
- Deeper content appears behind the window; nearer content can float in front
- Use `ZStack` with `.offset(z:)` (RealityKit) to place 3D content at specific depths
- Do not place windows at extreme distances (>10m or <0.5m) without specific reason

**Multiple windows:**
- Users can open multiple windows; design for independence
- Use `@Environment(\.openWindow)` action to open additional windows
- Avoid assuming a single-window user context

---

## Ornaments

Ornaments are controls that are visually attached to a window but float just in front of and outside the window frame. They are visionOS-specific.

**When to use:**
- Playback controls for a video window
- Toolbar actions for a document window
- Navigation tabs that belong to a window but shouldn't occupy content space

**Placement:** bottom edge of the window is standard. Side ornaments exist but are less discoverable.

**In SwiftUI:**
```swift
ContentView()
    .ornament(attachmentAnchor: .scene(.bottom)) {
        HStack {
            Button("Rewind") { }
            Button("Play") { }
            Button("Forward") { }
        }
        .padding()
        .glassBackgroundEffect()
    }
```

**Design rules:**
- Keep ornaments to a single row of controls — they have no scroll
- Always apply `.glassBackgroundEffect()` — bare ornaments look disconnected
- Do not replicate the entire window's functionality in ornaments

---

## Volumes

Volumes are 3D bounded content areas that appear in Shared Space.

**What they are:** a box of 3D space where RealityKit content renders; users can view from any angle; the volume doesn't resize based on content.

**When to use:**
- 3D models (products, objects, anatomy, architecture)
- Data visualization in 3D
- Mini-games or interactive objects that don't require Full Space

**When not to use:**
- Flat 2D content — use a window
- Content requiring 360° surround — use Full Space

**Sizing:** define volume size at creation; it cannot be resized by the user.

```swift
WindowGroup(id: "model-viewer") {
    ModelView()
}
.windowStyle(.volumetric)
.defaultSize(width: 0.5, height: 0.5, depth: 0.5, in: .meters)
```

---

## Gaze + Pinch Interaction Model

visionOS uses eyes + hands as the primary input. There is no cursor.

**Hover state (eye gaze):**
- When the user looks at an interactive element, it highlights — this IS the "hover" state
- Never require explicit cursor movement — the system handles this via eye tracking
- Implement with `.hoverEffect()` — this is not optional decoration; it is required affordance
- `.hoverEffect(.highlight)`: subtle scale + brightness change — default for buttons
- `.hoverEffect(.lift)`: 3D lift effect — for cards

**Pinch to activate (tap equivalent):**
- User looks at element (gaze activates it) then pinches index + thumb
- The "tap" is the pinch gesture, not a physical touch
- Standard `Button`, `Toggle`, `onTapGesture` work automatically

**Custom gestures:**
- `SpatialTapGesture`: tap in 3D space (with 3D hit position)
- `DragGesture`: drag in 3D (x/y/z)
- `MagnificationGesture`: pinch-to-zoom
- `RotateGesture3D`: two-hand rotation of 3D objects

**Never require explicit pointer/cursor targeting.** If a user has to "aim carefully" at an element with their eyes, the element is too small or the hit region is too tight.

---

## Comfortable Viewing Distance and FOV Zones

Spatial UI has physical ergonomics. Place content where it's comfortable to look at.

**Distance zones:**
| Zone          | Distance     | Use for                                |
|---------------|-------------|----------------------------------------|
| Near          | <0.5m        | Not recommended — causes eye strain    |
| Personal      | 0.5–1m       | Handheld-like content, small objects   |
| Social        | 1–3m         | Primary windows, typical apps          |
| Distant       | 3–10m        | Panoramic content, large displays      |
| Beyond 10m    | —            | Avoid interactive content              |

**Field of view:**
- Comfortable horizontal FOV: ±30° from center
- Comfortable vertical FOV: ±15° from eye level
- Do not place primary interactive controls at extreme angles — they cause neck strain
- Anchored windows (attached to user position via `WindowGroup` with `.worldTracked` or pinning) respect this naturally

---

## Collision Zones: UI Spacing for Precision

In visionOS, interactive elements need physical space between them for gaze precision.

**Rule:** minimum 8pt gap between interactive elements in 2D windows (same as iOS).

**Critical difference:** in 3D space, elements at different depths can visually overlap but their gaze regions do not conflict — the system correctly resolves depth. However, elements at the same depth with less than ~4° of visual separation will cause accidental activations.

**Practical guidance:**
- Toolbar buttons: 44pt minimum, 8pt gap — same as iOS
- 3D objects in a volume: maintain at least 5cm physical separation for reliable selection
- Clusters of small 3D markers: use `hover effects` that expand hitbox on gaze — don't use tiny fixed targets

---

## Typography on visionOS

**Font:** SF Pro only. No SF Compact, no SF Rounded in standard visionOS UI.

**Minimum size:** 17pt. At arm's length (~60cm), smaller text requires the user to squint or lean in — both break the experience.

**Legibility on glass:**
- Light text on glass background works well
- Dark text on glass: test carefully — refraction can reduce contrast
- Add `.shadow(radius: 2)` to text over complex 3D backgrounds

**Recommended sizes:**
| Use              | Min size  |
|------------------|-----------|
| Button label     | 17pt      |
| Body content     | 17–19pt   |
| Section headers  | 20–22pt   |
| Window title     | 22pt+     |
| Caption/metadata | 15pt (minimum on visionOS) |

---

## Audio Spatialization as UI Feedback

Positional audio is a first-class UI feedback channel in visionOS.

- System UI sounds (button taps, alerts) are automatically spatialized to the element's position
- RealityKit `AudioFileResource` and `SpatialAudio` component for 3D audio from objects
- Use spatial audio to reinforce spatial position of events: a sound from a window to the left tells the user "something happened over there"
- Do not use non-spatial mono audio for events tied to 3D objects — it breaks immersion
- Volume control: user-adjustable; don't design audio feedback that requires a specific volume level

---

## App Clip Entry Points on visionOS

visionOS supports App Clips via spatial anchors and QR codes.

- App Clips can launch directly into a targeted visionOS experience
- Entry points: QR codes, NFC tags, spatial anchors attached to physical objects
- Clip size limit: 15MB (same as iOS)
- App Clips on visionOS default to Shared Space — they cannot launch into Full Space

**Design for App Clips:**
- Launch directly into the relevant content; no onboarding
- The Clip must complete its core task without requiring account creation
- Transition to full app install should be a single prompt at natural completion

---

## Common Pitfalls

- Placing interactive elements without `.hoverEffect()` — users cannot tell what's tappable
- Building opaque window backgrounds — looks flat and wrong in the environment
- Using Full Space for content that works fine as a window (wastes user immersion budget)
- Tiny touch targets from iOS that become gaze-imprecise in visionOS
- Playing non-spatial audio for 3D events
- Assuming single-window usage when users routinely have 4+ windows open simultaneously
- Not testing at actual arm's length — simulator does not replicate real viewing angles
