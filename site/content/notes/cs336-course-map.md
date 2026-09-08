---
title: Stanford CS336 · 自学执行地图
date: 2026-09-08
summary: 下周 L1–L3 与 A1 tokenizer 逐日清单，国庆争取收口 A1，完整串起 19 讲与五个作业。
track: cs336
tags: [cs336, language-modeling, systems, scaling, data, alignment]
status: planned
mastery: learning
evidence:
  - "source: Stanford CS336 Spring 2026 official course page and schedule"
  - "source: official assignment repositories for Basics, Systems, Scaling, Data, and Alignment"
---

## 当前执行策略（2026-09-08 更新）

本周（9.8–9.13）收完剩余 Karpathy 课程并做最小实践；下周（9.14–9.18）把主要时间交给 CS336。目标是学习 L1–L3，完成 A1 tokenizer 的实现与相关测试，有余力开始模型组件。每天具体的看课时间、参考链接、动手任务和完成标准已经放在[每日待办](https://feng-nengyu.github.io/zero-GPT/daily/#2026-09-14)。

已确认手边有一张 A100 可用；显存容量、环境、吞吐与第二台机器条件尚未实测。国庆前专心课程，RAG 评测暂缓。9.19–9.29 左右休息，暂定 9.30 恢复，国庆在校继续推进 A1。

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

- 已确认手边有一张 A100，先实测环境与显存，再完成 correctness、profiling 与可复现实验。
- 另一台预期各配一张 A100 的机器仍待确认；只有网络、NCCL 与拓扑实测通过后，才把 multi-node 当作可用能力。
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

## 两周内，具体怎样推进

下列都是学习预算，包含暂停与笔记，不是视频净时长，更不是已经完成的工时。完整学习日总计 5 小时，其中主线 4 小时 20 分钟、算法 25 分钟、记录 15 分钟；每天另外留 1 小时锻炼。周日用 2 小时收尾。

| 日期 | 课程与主线时间 | 看完接着做 | 当天要留下什么 |
|---|---|---|---|
| 9.8 | L5 检查 40m，L6 70m，编码 110m，检查 40m | 写出上下文分组，运行前后向与短训练 | 自己的梯度解释、shape 与运行结果 |
| 9.9 | Build GPT 140m，编码 90m，检查 30m | 接通 attention、block、训练和采样 | mask / shape 检查，loss 与生成样本 |
| 9.10 | Tokenizer 150m，编码 90m，检查 20m | 做小 BPE，验证中文与 emoji 往返 | 基础 encode/decode、边界与失败例子 |
| 9.11 | GPT-2 前半程 135m，编码 100m，配置检查 25m | 跑通模型，检查 A100 环境与显存 | 参数量、配置、一个训练 step |
| 9.12 | GPT-2 后半程 140m，State of GPT 50m，短训练 50m，检查 20m | 单卡短训练并记录指标 | loss、峰值显存、tokens/s、采样 |
| 9.13 | 回忆 30m，修一个缺口 55m，下周预览 15m | 用自己代码收尾，周一进入 CS336 | 实际课程/实践状态与一个待补点 |
| 9.14 | 版本/环境 35m，L1 95m，handout 40m，编码 90m | 固定版本，写 byte 词表与 decode 骨架 | SHA、环境、bytes roundtrip |
| 9.15 | 阅读 35m，编码 170m，测试 55m | BPE trainer、边界与确定性 | 手算对照、trainer 测试结果 |
| 9.16 | L2 95m，编码 125m，检查 40m | encode/decode 与 special tokens | 资源估算、编码路径测试 |
| 9.17 | 阅读 30m，编码 135m，测试 65m，小实验 30m | iterable、完整 tokenizer 检查与小语料 | 通过/失败范围、耗时与配置 |
| 9.18 | L3 95m，阅读 35m，编码 100m，保存恢复点 30m | tokenizer 达标后进入基础模型组件 | 半马前成果与 9.30 恢复入口 |

CS336 录像从[官方课程页链接的列表](https://www.youtube.com/watch?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV&v=JuoVZkPBiKk)进入。每讲先留 95 分钟；录像实际年份、长度与讲义差异在 9.14 核对，不能把官网链接的旧录像直接称为 2026 新录像。

- L1 配套：[Overview / tokenization 讲义](https://cs336.stanford.edu/lectures/?trace=lecture_01)，重点连接 A1 tokenizer 的要求。
- L2 配套：[PyTorch / resource accounting 讲义](https://cs336.stanford.edu/lectures/?trace=lecture_02)，看完做 tensor shape、FLOPs 与内存估算。
- L3 配套：[Architectures / hyperparameters 讲义](https://github.com/stanford-cs336/lectures/blob/main/lecture_03.pdf)，看完按 handout 拆模型组件。
- A1 配套：[官方 handout](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf)，实现要求与测试以正式固定的版本为准。

## 19 讲与五个作业的后续衔接

| 自学阶段 | 课程范围 | 实现与实验重点 | 进取时间目标 |
|---|---|---|---|
| A1 Basics | L1–L4 | tokenizer → 模型组件 → optimizer / loss → 训练与 checkpoint → 单卡实验 | 9.14–10.08，扣除休息期 |
| A2 Systems | L5–L8、L10 | 稳定测量 → profiling → Triton attention → 并行和显存优化 | 10.09–10.25 |
| A3 Scaling | L9、L11 | 预算设计 → 受控 sweep → 拟合 → 留出点验证与外推分析 | 10.26–11.08 |
| A4 Data | L12–L14 | 抽取 → 过滤 → 去重 → tokenization → 统一训练预算的对照 | 11.09–11.22 |
| A5 Alignment | L15–L17 | 固定评测 → SFT 基线 → reasoning RL → 结果与失败样本分析 | 11.23–12.06 |
| Guest lectures | L18–L19 | 核对公开材料，每讲留一个与作业相关的问题 | 课程收口时补全 |

展开[学习地图中的每个作业](https://feng-nengyu.github.io/zero-GPT/roadmap/)，可以看到顺序、预计工时、完成标准与官方入口。A1 国庆收口、12 月上旬完成五个作业的自学版本是进取目标；按真实实现耗时每周调整。不可获取的录像、多卡实验或官方 API 项目单独登记，不虚构全部完成。

下周优先保住 tokenizer 的正确实现和测试，模型部分可放到国庆。视频看完、最小实践完成、已掌握以及官方满规模要求分别记录；超时就缩小当日动作，休息期没有学习债。

## 当前状态

本次调整学习计划、资料入口，并记录一张 A100 已可用。CS336 仍未开始，未完成版本冻结、课程学习或任何作业验收。
