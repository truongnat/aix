#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROMPT="${1:-Explain quantum computing in one sentence}"

echo "=== LLM Provider Comparison ==="
echo ""
echo "Prompt: $PROMPT"
echo ""

# Create temp workflow
WORKFLOW=$(mktemp /tmp/compare_workflow.XXXXXX.md)
cat > "$WORKFLOW" << EOF
# Provider Comparison Workflow

### test_prompt
- skill: llm_subagent
- input: "$PROMPT"
- on_failure: abort
EOF

cleanup() {
    rm -f "$WORKFLOW"
}
trap cleanup EXIT

# Test each provider
PROVIDERS=("ollama" "openai" "gemini" "anthropic")
RESULTS=()

for provider in "${PROVIDERS[@]}"; do
    echo -e "${BLUE}Testing $provider...${NC}"
    
    # Check if provider is configured
    case $provider in
        "openai")
            if [ -z "$OPENAI_API_KEY" ]; then
                echo -e "${YELLOW}⊘ Skipped (OPENAI_API_KEY not set)${NC}"
                echo ""
                continue
            fi
            ;;
        "gemini")
            if [ -z "$GEMINI_API_KEY" ]; then
                echo -e "${YELLOW}⊘ Skipped (GEMINI_API_KEY not set)${NC}"
                echo ""
                continue
            fi
            ;;
        "anthropic")
            if [ -z "$ANTHROPIC_API_KEY" ]; then
                echo -e "${YELLOW}⊘ Skipped (ANTHROPIC_API_KEY not set)${NC}"
                echo ""
                continue
            fi
            ;;
        "ollama")
            if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
                echo -e "${YELLOW}⊘ Skipped (Ollama not running)${NC}"
                echo ""
                continue
            fi
            ;;
    esac
    
    # Run workflow
    START_TIME=$(date +%s%3N)
    OUTPUT=$(AGENTIC_SDLC_LLM_PROVIDER=$provider cargo run --quiet -- --workflow "$WORKFLOW" 2>&1 | grep -E "(completed|summary|cost)" || true)
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    # Extract metrics
    TOKENS=$(echo "$OUTPUT" | grep -oE "tokens=[0-9]+" | grep -oE "[0-9]+" || echo "0")
    COST=$(echo "$OUTPUT" | grep -oE "cost_usd=[0-9.]+" | grep -oE "[0-9.]+" || echo "0.0")
    
    echo -e "${GREEN}✓ Completed${NC}"
    echo "  Duration: ${DURATION}ms"
    echo "  Tokens: $TOKENS"
    echo "  Cost: \$$COST"
    echo ""
    
    RESULTS+=("$provider|$DURATION|$TOKENS|$COST")
done

# Summary table
echo "=== Summary ==="
echo ""
printf "%-12s %-12s %-12s %-12s\n" "Provider" "Duration" "Tokens" "Cost"
printf "%-12s %-12s %-12s %-12s\n" "--------" "--------" "------" "----"

for result in "${RESULTS[@]}"; do
    IFS='|' read -r provider duration tokens cost <<< "$result"
    printf "%-12s %-12s %-12s \$%-11s\n" "$provider" "${duration}ms" "$tokens" "$cost"
done

echo ""
echo "=== Recommendations ==="
echo ""

# Find fastest
FASTEST=""
FASTEST_TIME=999999
for result in "${RESULTS[@]}"; do
    IFS='|' read -r provider duration tokens cost <<< "$result"
    if [ "$duration" -lt "$FASTEST_TIME" ]; then
        FASTEST_TIME=$duration
        FASTEST="$provider"
    fi
done

# Find cheapest
CHEAPEST=""
CHEAPEST_COST=999999
for result in "${RESULTS[@]}"; do
    IFS='|' read -r provider duration tokens cost <<< "$result"
    cost_int=$(echo "$cost * 1000000" | bc | cut -d. -f1)
    if [ "$cost_int" -lt "$CHEAPEST_COST" ]; then
        CHEAPEST_COST=$cost_int
        CHEAPEST="$provider"
    fi
done

echo "Fastest: $FASTEST (${FASTEST_TIME}ms)"
echo "Cheapest: $CHEAPEST (\$$(echo "scale=6; $CHEAPEST_COST / 1000000" | bc))"
echo ""
echo "For production: openai (reliable, deterministic)"
echo "For development: ollama (free, local)"
echo "For cost optimization: gemini (cheapest cloud)"
