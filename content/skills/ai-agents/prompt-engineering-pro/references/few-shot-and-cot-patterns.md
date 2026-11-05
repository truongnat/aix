# Few-Shot and Chain-of-Thought Patterns

## Few-shot design

### Quantity

- 2-3 examples is usually sufficient for simple tasks.
- 5-10 for complex or ambiguous tasks.
- More than 10 rarely helps; focus on quality and diversity.

### Quality

- Examples must be correct. One bad example teaches the model the wrong pattern.
- Cover edge cases: happy path, boundary conditions, errors.
- Match production distribution: if 20% of inputs are ambiguous, 20% of examples should be ambiguous.

### Format

```
Input: <example input>
Output: <example output>

Input: <example input>
Output: <example output>
```

Use the exact delimiter the model will see in production.

## Chain-of-thought (CoT)

- Add "Let's think step by step" or similar to the user prompt.
- For complex reasoning, ask the model to output reasoning before the final answer.
- CoT increases accuracy on math, logic, and multi-step tasks at the cost of tokens.

### Example

```
Q: A train travels 60 km/h for 2 hours and 40 km/h for 3 hours. What is the average speed?
A: Let's think step by step.
Step 1: Distance at 60 km/h = 60 × 2 = 120 km.
Step 2: Distance at 40 km/h = 40 × 3 = 120 km.
Step 3: Total distance = 120 + 120 = 240 km.
Step 4: Total time = 2 + 3 = 5 hours.
Step 5: Average speed = 240 / 5 = 48 km/h.
Final answer: 48 km/h
```

## ReAct (Reasoning + Action)

For agents that use tools:

```
Thought: I need to find the current weather in Paris.
Action: search_web({"query": "current weather Paris"})
Observation: "Partly cloudy, 18°C, wind 12 km/h"
Thought: The user asked for a packing suggestion based on weather.
Action: generate_packing_list({"weather": "partly cloudy, 18°C"})
Observation: "Light jacket, umbrella, comfortable shoes"
Final Answer: Pack a light jacket, umbrella, and comfortable shoes.
```

## Self-consistency

- Generate multiple CoT answers and vote on the most common result.
- Increases accuracy at the cost of latency and cost.
- Best for high-stakes reasoning tasks.
