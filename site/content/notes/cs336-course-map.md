---
title: Stanford CS336 · 自学执行地图
date: 2026-09-08
summary: 半马前切入 L1 与 tokenizer 小实现，国庆推进 A1，按依赖紧凑完成五个作业的自学版本。
track: cs336
tags: [cs336, language-modeling, systems, scaling, data, alignment]
status: planned
mastery: learning
evidence:
  - "source: Stanford CS336 Spring 2026 official course page and schedule"
  - "source: official assignment repositories for Basics, Systems, Scaling, Data, and Alignment"
---

## 当前执行策略（2026-09-08 更新）

希望尽早完成 Karpathy 与 CS336，半马前就做完 CS336 的一部分。现在按知识依赖衔接两门课：先完成 L5 校准、Lecture 6 和 Build GPT 的关键代码，再切入 CS336 L1 与 A1 tokenizer 切片。GPT-2 124M 完整复现不再作为 tokenizer 部分的前置条件。

国庆前主要精力留给课程与必要基础，RAG 评测暂缓。暂定 9 月 19–29 日左右休息、9 月 30 日恢复，国庆在校学习。具体安排见[学习地图](https://feng-nengyu.github.io/zero-GPT/roadmap/)。

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

## 分阶段进入条件

**进入 L1 与 A1 tokenizer 切片**：能用 Python 处理 bytes、字典和序列，理解 UTF-8 编码与基本测试。缺口在任务内补齐，不必先完成 GPT-2 复现。

**进入 A1 模型与训练部分**：先完成 Build GPT 的关键实践，能解释 causal attention 和主要 tensor shape，自己运行训练、sampling 与小数据 overfit。optimizer、checkpoint、资源估算可结合 CS336 L2/L3 继续学习；不能用助手写好的代码代替验收。

**进入 A2**：A1 模型与训练基线必须可测、可复现，并能够解释 autograd、参数与激活显存以及测量方法。

Karpathy 的 Tokenizer 与 A1 的 tokenizer 概念可以相互衔接，但作业核心实现仍由学习者完成。原来的“完成整套 GPT-2 才能开始 CS336”已不再适用。

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

Spring 2026 官方主页当前链接上述五个仓库；其中 A1 README 标题仍保留 Spring 2025，说明仓库标签并不完全统一。正式开始每个作业时应记录当日 commit SHA，并以同一 offering 的 handout、tests 与 lectures 为一组，避免跨版本混用。2026-09-08 已重新核对课程主页与 A1 README；正式进入时再审计讲义、录像及测试，并记录固定 commit SHA。本次尚未冻结版本。

## 紧凑节奏与校准

以下是根据每天 5 小时作出的进取预算，不是官方工时，也不是已完成记录：

| 时间 | 目标 | 可核验产物 |
|---|---|---|
| 9.8–9.10 | L5 校准、Lecture 6 | 本人概念解释、初始化实验解读、关键 tensor shape |
| 9.11、9.14–9.15 | Build GPT | 可运行的小模型、causal mask 和 shape 检查、训练与采样 |
| 9.16–9.18 | CS336 L1 与 A1 tokenizer 切片 | 固定版本记录、本人基础 encode/decode、含中文的 roundtrip 测试 |
| 9.19–9.29 左右 | 半马与休息 | 不排任务、不积累学习债务，暂按 9.30 恢复 |
| 9.30–10.18 | A1、Tokenizer、State of GPT 与 GPT-2 124M | 模型与训练测试、小规模训练报告、复现规模差异 |
| 10.19–11.08 | A2 / A3 与对应课程 | profiling 与优化对比、scaling 实验和外推限制 |
| 11.09–12.06 | A4 / A5 与课程收口 | 数据 pipeline、对齐实验、可复现记录 |

半马前必须做小：L1 与 tokenizer 的可验证切片优先，BPE trainer 和完整 tokenizer 测试作为冲刺。若 Build GPT 超时，就缩小首个切片，完整 BPE 放到国庆；不挤占休息期。

9.8–18 按 9 个工作日共 45 小时估算，其中约 39 小时主线、3.75 小时算法、2.25 小时记录。如果 9.8 当天已无完整学习时间，首个检查点按剩余工时调整。国庆后每周根据 A1 实际工时校准；12 月上旬是进取目标，算力不足或实现耗时更长时如实调整，绝不靠缩减学习证据宣布完成。

## 当前状态

本次仅调整学习计划与资料入口。CS336 仍未开始，未完成版本冻结、课程学习或任何作业验收。
