# Engine (Autonomous Mode)

## LangGraph.js StateGraph

`@x/engine` dùng `StateGraph` từ `@langchain/langgraph` v1.4.7 làm autonomous engine.

## Graph flow

```
START
  └─► plan ──[interrupt?]──► END
        └─► rules ──► tasks ──► loopStart
                                    └─[hard stop?]──► END
                                    └─► pick ──[no task?]──► END
                                          └─► ticketPlan ──[denylist/interrupt?]──► END
                                                └─► coder ──► reviewer
                                                               └─[score≥9 / attempts≥3]──► END
                                                               └─► loopStart (cycle)
```

## Nodes

| Node | Chức năng |
|------|-----------|
| `plan` | Tạo kế hoạch từ goal — gọi provider |
| `rules` | Áp policy + coding rules vào session |
| `tasks` | Breakdown kế hoạch thành task list |
| `loopStart` | Reset interrupt flag cho iteration mới |
| `pick` | Pick task pending tiếp theo |
| `ticketPlan` | Lập kế hoạch chi tiết cho ticket, kiểm tra shell denylist |
| `coder` | Implement code — gọi provider |
| `reviewer` | Review code, chấm điểm 0-10 |

## Budget & stop conditions

- **Score ≥ 9/10** → PASS, kết thúc loop
- **Attempts ≥ 3** → MAX_ATTEMPTS, dừng
- **`budget.usdSpent >= budget.usdLimit`** → hard stop ngay lập tức
- **Interrupt** → HITL ask, user quyết định proceed hay cancel

## Checkpointer

`MemorySaver` (in-process) checkpoint state sau mỗi node. Dùng `EngineGraph.resume(state)` để tiếp tục session bị ngắt.

## API

```typescript
import { EngineGraph, createInitialEngineState } from '@x/engine';

const engine = new EngineGraph();
const initial = createInitialEngineState(session);

// Chạy từ đầu
const result = await engine.run(initial);

// Resume từ checkpoint
const resumed = await engine.resume(savedState);
```
