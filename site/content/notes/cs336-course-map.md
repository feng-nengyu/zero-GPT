---
title: Stanford CS336 · 自学执行地图
date: 2026-09-04
summary: 基于 Spring 2026 官方课程与五个作业，明确依赖、进入条件、算力缩放和自学完成证据。
track: cs336
tags: [cs336, language-modeling, systems, scaling, data, alignment]
status: planned
mastery: learning
evidence:
  - "source: Stanford CS336 Spring 2026 official course page and schedule"
  - "source: official assignment repositories for Basics, Systems, Scaling, Data, and Alignment"
---

## 结论

CS336 不作为现在与 Karpathy 并行推进的第二门重课。先完成 Karpathy 的 GPT、Tokenizer 与 GPT-2 复现，再用 readiness gate 判断是否进入 CS336。这样 A1 是一次能力整合，而不是重新补 PyTorch 基础。

本地图核对的是 [Stanford CS336 Spring 2026 官方主页](https://cs336.stanford.edu/)。课程共有 19 讲，覆盖 tokenization、architecture、GPU/Triton、parallelism、scaling、inference、evaluation、data、post-training 与 multimodality。

## 五个作业与依赖

| 阶段 | 官方作业 | 核心任务 | 对下一阶段的作用 |
|---|---|---|---|
| A1 | [Basics](https://github.com/stanford-cs336/assignment1-basics) | 实现 tokenizer、Transformer、optimizer 与训练循环，并训练最小语言模型 | 形成后续 systems 实验的模型基线 |
| A2 | [Systems](https://github.com/stanford-cs336/assignment2-systems) | profiling、benchmarking、Triton FlashAttention2、内存优化与 distributed training | 让“能训练”升级为“知道瓶颈并能扩展” |
| A3 | [Scaling](https://github.com/stanford-cs336/assignment3-scaling) | 分析 Transformer 组件，并通过训练实验拟合 scaling law | 为算力预算与模型/数据配比提供依据 |
| A4 | [Data](https://github.com/stanford-cs336/assignment4-data) | 把 Common Crawl WET 数据变成可训练语料，完成语言识别、过滤、去重和数据质量实验 | 补齐模型之外的数据工程与评测能力 |
| A5 | [Alignment](https://github.com/stanford-cs336/assignment5-alignment) | 用 SFT 与 reasoning RL 训练数学推理模型；可选安全对齐与 DPO | 接到 post-training、evaluation 与求职项目 |

依赖主线是 A1 → A2；A3 依赖训练与实验分析能力；A4 使用统一训练实现检验数据质量；A5 把前面的模型、训练和评测能力汇合起来。五个作业不应被当成互不相关的 notebook。

## Readiness gate

进入 A1 前需要同时满足：

- 能独立写出 decoder-only Transformer 的主要模块，并解释关键 Tensor shape。
- 能自己实现和调试训练循环、optimizer、checkpoint 与 sampling。
- 能使用 PyTorch autograd，但也能手算和检查局部梯度。
- 能在 CPU 上先跑 unit test 和 tiny overfit，再迁移到 GPU。
- 能粗略估算 parameter、activation memory 与训练 FLOPs。

Karpathy 的 GPT、Tokenizer 与 GPT-2 复现将提供前三项证据；缺少的 systems bridge 在进入 A1 前单独补齐。

## 面向现有算力的缩放规则

官方 A4 最终训练配置使用 8 张 B200，A3 的学生训练 API 也不是校外自学者可以默认依赖的资源。因此“完成作业”采用 fidelity-preserving scale-down：缩小模型、数据和训练步数，但保留完整 pipeline、变量控制、评测与结果解释。

- 默认先在一张 A100 上完成 correctness、profiling 与可复现实验。
- 第二张 A100 位于另一台机器；只有网络、NCCL 与拓扑实测通过后，才把 multi-node 当作可用能力。
- A2 的重点是测量、瓶颈解释与优化前后对比，不以追逐官方 leaderboard 为目标。
- A3 若无法使用官方 API，就运行本地小规模 sweep，并明确外推边界。
- A4 保留 WET → filter → deduplicate → tokenize → train → evaluate 的完整链路，缩小文件数与训练预算。
- A5 先选择可在单卡上稳定复现的小模型与数学数据子集，再决定是否扩大。

## 每个作业的自学完成标准

一个作业只有同时满足以下条件才算完成：

1. 核心实现由学习者完成，官方 unit tests 或等价本地 tests 通过。
2. 至少有一次 CPU smoke test 和一次与作业目标相关的 GPU 实验。
3. 保存配置、环境、随机种子、关键指标与失败记录。
4. 能口头解释一个核心机制，并现场定位一个小 bug 或性能问题。
5. 形成公开安全的项目页或技术复盘；不公开课程禁止传播的答案、测试内容或第三方代码。

## 与 Codex 的协作边界

官方课程允许 AI 回答低层编程问题或高层概念问题，但不允许直接代做作业。自学时延续这一原则：Codex 可以拆解问题、解释概念、设计额外测试、审查学习者代码和提供逐级提示；核心实现与实验解释由学习者完成。这样公开仓库中的证据才真正服务于面试。

## 版本策略

Spring 2026 官方主页当前链接上述五个仓库；其中 A1 README 标题仍保留 Spring 2025，说明仓库标签并不完全统一。正式开始每个作业时应记录当日 commit SHA，并以同一 offering 的 handout、tests 与 lectures 为一组，避免跨版本混用。进入 CS336 前再做一次官方版本审计。

## 预定节奏

- 2026 年：完成 Karpathy GPT 主线与一个可量化 RAG/evaluation 项目。
- 2027 H1：A1 Basics → A2 Systems → A3 Scaling，同时服务暑期实习准备。
- 2027 H2：A4 Data → A5 Alignment，并将 evaluation、multimodality 与 VLA 探索连接起来。

这是一张后续执行地图，不会改变今天的三个 Focus，也不会在当前 Lecture 5 检查完成前提前启动 CS336。
