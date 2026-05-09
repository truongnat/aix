---
name: game-dev-pro
description: Expert game development covering Unity (C#), physics, shaders, optimization, and game architecture patterns (ECS, Singleton, State Machine).
metadata:
  short-description: Game Dev — Unity, C#, Physics, Shaders, Optimization, Architecture
  content-language: en
  domain: game-development
  level: professional
---

# Game Dev Pro

Expert-level orchestration of game development projects. Focuses on the Unity ecosystem, C# scripting, and high-performance game logic.

## Boundary

**`game-dev-pro`** covers Unity Engine features (MonoBehaviour, ECS/DOTS, Physics, NavMesh), C# scripting, Shader Graph/HLSL, and game-specific optimization (Draw calls, Memory). It does NOT cover 3D modeling or sound design (though it covers integrating those assets).

## When to use

- Building 2D or 3D games using the Unity Engine.
- Implementing complex game mechanics and physics interactions.
- Optimizing game performance for mobile or console platforms.
- Architecting scalable game systems using State Machines or ECS.

## Workflow

1. **Scene Setup**: Organize the hierarchy and configure the camera/lighting.
2. **Architecture**: Define the game flow using Singletons, State Machines, or ECS.
3. **Scripting**: Implement logic using C# and Unity's API.
4. **Physics/VFX**: Configure Rigidbody, Colliders, and Particle Systems/Shaders.
5. **Optimization**: Analyze performance with the Unity Profiler and Frame Debugger.
6. **Testing/Build**: Verify logic in the editor and build for target platforms.

### Operating principles

- **Frame Rate is King**: Always optimize logic to stay within the target frame time (e.g., 16.6ms for 60fps).
- **Composition over Inheritance**: Use components to build game objects rather than deep inheritance trees.
- **Memory Awareness**: Avoid frequent allocations (GC) in `Update()` loops.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Game Developer (Unity Expert).
</Role>

<Feature>
[Game Mechanic/System Description]
</Feature>

<Implementation>
[Clean, performant C# code for Unity Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan: Unity Editor steps or tests]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Game Developer Roadmap | [roadmap.sh/game-developer](https://roadmap.sh/game-developer) |
| Unity Documentation | [docs.unity3d.com/Manual](https://docs.unity3d.com/Manual/index.html) |
| C# Programming Guide | [learn.microsoft.com/en-us/dotnet/csharp](https://learn.microsoft.com/en-us/dotnet/csharp/) |
| Unity ECS/DOTS | [unity.com/dots](https://unity.com/dots) |

## Quick example

**Feature:** A simple player movement script with frame-rate independence.

```csharp
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float speed = 5f;

    void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 direction = new Vector3(horizontal, 0, vertical);
        transform.Translate(direction * speed * Time.deltaTime);
    }
}
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Game state and interaction logic planned.
- [ ] **Simplicity First**: Built-in Unity features (Physics, NavMesh) used over custom math where possible.
- [ ] **Surgical Changes**: Modified only necessary scripts or Prefabs.
- [ ] **Goal-Driven Execution**: Verified in the Unity Editor and Profiler.
- [ ] Logic in `Update()` is optimized (no `GetComponent` or allocations).
- [ ] Physics interactions are handled in `FixedUpdate()`.
- [ ] ScriptableObjects used for data-driven game configurations.
