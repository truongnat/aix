# Skill: openrlhf-training
Schema: antigrav.skill@v1

```json
{
  "description": "High-performance RLHF framework with Ray+vLLM acceleration. Use for PPO, GRPO, RLOO, DPO training of large models (7B-70B+). Built on Ray, vLLM, ZeRO-3. 2× faster than DeepSpeedChat with distributed a",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155379,
  "model": "qwen3:8b",
  "name": "openrlhf-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/openrlhf/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "distributed training",
    "dpo",
    "grpo",
    "large models",
    "openrlhf",
    "post-training",
    "ppo",
    "ray",
    "rlhf",
    "rloo",
    "vllm",
    "zero-3"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
High-performance RLHF framework with Ray+vLLM acceleration. Use for PPO, GRPO, RLOO, DPO training of large models (7B-70B+). Built on Ray, vLLM, ZeRO-3. 2× faster than DeepSpeedChat with distributed architecture and GPU resource sharing.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Launch Docker container
docker run --runtime=nvidia -it --rm --shm-size="10g" --cap-add=SYS_ADMIN \
  -v $PWD:/openrlhf nvcr.io/nvidia/pytorch:25.02-py3 bash

# Uninstall conflicts
sudo pip uninstall xgboost transformer_engine flash_attn pynvml -y

# Install OpenRLHF with vLLM
pip install openrlhf[vllm]
- ray start --head --node-ip-address 0.0.0.0 --num-gpus 8

ray job submit --address="http://127.0.0.1:8265" \
  --runtime-env-json='{"working_dir": "/openrlhf"}' \
  -- python3 -m openrlhf.cli.train_ppo_ray \
  --ref_num_nodes 1 --ref_num_gpus_per_node 8 \
  --reward_num_nodes 1 --reward_num_gpus_per_node 8 \
  --critic_num_nodes 1 --critic_num_gpus_per_node 8 \
  --actor_num_nodes 1 --actor_num_gpus_per_node 8 \
  --vllm_num_engines 4 --vllm_tensor_parallel_size 2 \
  --colocate_all_models \
  --vllm_gpu_memory_utilization 0.5 \
  --pretrain OpenRLHF/Llama-3-8b-sft-mixture \
  --reward_pretrain OpenRLHF/Llama-3-8b-rm-700k \
  --save_path ./output/llama3-8b-rlhf \
  --micro_train_batch_size 8 --train_batch_size 128 \
  --micro_rollout_batch_size 16 --rollout_batch_size 1024 \
  --max_epochs 1 --prompt_max_len 1024 --generate_max_len 1024 \
  --zero_stage 3 --bf16 \
  --actor_learning_rate 5e-7 --critic_learning_rate 9e-6 \
  --init_kl_coef 0.01 --normalize_reward \
  --gradient_checkpointing --packing_samples \
  --vllm_enable_sleep --deepspeed_enable_sleep
- # Same command as PPO, but add:
--advantage_estimator group_norm

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/openrlhf/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# OpenRLHF - High-Performance RLHF Training ## Quick start OpenRLHF is a Ray-based RLHF framework optimized for distributed training with vLLM inference acceleration. **Installation**: ```bash # Launch Docker container docker run --runtime=nvidia -it --rm --shm-size="10g" --cap-add=SYS_ADMIN \ -v $PWD:/openrlhf nvcr.io/nvidia/pytorch:25.02-py3 bash # Uninstall conflicts sudo pip uninstall xgboost transformer_engine flash_attn pynvml -y # Install OpenRLHF with vLLM pip install openrlhf[vllm] ``` **PPO Training** (Hybrid Engine): ```bash ray start --head --node-ip-address 0.0.0.0 --num-gpus 8 ray job submit --address="http://127.0.0.1:8265" \ --runtime-env-json='{"working_dir": "/openrlhf"}' \ -- python3 -m openrlhf.cli.train_ppo_ray \ --ref_num_nodes 1 --ref_num_gpus_per_node 8 \ --reward_n

{{input}}
