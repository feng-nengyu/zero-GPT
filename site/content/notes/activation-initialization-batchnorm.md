---
title: 初始化、tanh 与 BatchNorm · 掌握检查
date: 2026-09-04
summary: 从已提交的学习截图接入初始化与归一化知识，等待概念解释和最小代码实验完成验收。
track: karpathy
tags: [initialization, tanh, batch-normalization, pytorch]
status: checking
mastery: checking
evidence:
  - "conceptual-input: 已提交学习笔记截图，涵盖 Kaiming initialization、BatchNorm 公式与 PyTorch API"
---

## 当前状态

这部分已经学习并形成过笔记，但尚未达到“已掌握”。当前只确认学习输入，不把整理过的文字当作掌握证据。

## 已从提交笔记中接入

- 初始化关注的是深层网络中信号与梯度能否稳定传播。
- 笔记记录了 torch.nn.init.kaiming_normal_ 及其与 fan_in、nonlinearity 的关系。
- BatchNorm 部分记录了 mini-batch mean、variance、标准化以及可学习的 gamma、beta。
- 笔记也提到 residual connection、normalization 与 optimizer 会共同影响现代网络的训练稳定性。

以上是“学过什么”的索引，不等于已经能独立解释机制或用实验验证。

## 当前验收入口

第一道概念题已经放在 [2026-09-04 Daily](https://feng-nengyu.github.io/zero-GPT/daily/2026-09-04/) 中。保持逐题对话：先完成当前回答，再根据答案决定是否追问，不提前堆叠整套题目。

## 掌握证据账本

| 证据类型 | 状态 | 要求 |
|---|---|---|
| 学习输入 | 已记录 | 用户提交的初始化与 BatchNorm 学习截图 |
| 概念解释 | 等待回答 | 能用自己的话说明前向激活与反向梯度的机制 |
| 实践验证 | 未开始 | 完成一个比较不同初始化尺度的最小 PyTorch 实验 |

只有概念解释和实践验证都完成后，状态才会从 checking 改为 mastered。

## 参考资料

- [Delving Deep into Rectifiers](https://arxiv.org/abs/1502.01852)
- [Batch Normalization](https://arxiv.org/abs/1502.03167)
- [PyTorch torch.nn.init documentation](https://docs.pytorch.org/docs/stable/nn.init.html#torch.nn.init.kaiming_normal_)
