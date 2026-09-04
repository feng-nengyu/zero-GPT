---
title: zero-GPT
date: 2026-09-04
summary: 从标量自动微分出发，逐步复现神经网络、字符语言模型、GPT 与训练系统。
track: karpathy
tags: [pytorch, language-model, from-scratch]
status: learning
featured: true
links:
  github: https://github.com/feng-nengyu/zero-GPT
---

## 项目目标

不把模型当成黑盒。从一个标量 `Value`、计算图和反向传播开始，逐步建立对 MLP、字符语言模型、训练稳定性、Transformer、Tokenizer 与 GPT 训练过程的实现级理解。

## 当前产出

- 标量自动微分与 MLP 实现。
- Bigram 字符语言模型 notebook 与学习笔记。
- Makemore MLP、embedding、上下文窗口、训练与验证集笔记。
- 正在进入训练稳定性与下一阶段课程的掌握检查。

## 完成定义

每个阶段都需要同时留下概念解释、最小实现、实验结果和一次独立掌握检查。课程播放进度只代表“已学习”，不会自动等于“已掌握”。
