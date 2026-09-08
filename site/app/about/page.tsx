import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="shell page-shell about-shell">
      <header className="about-hero">
        <div className="portrait-placeholder" aria-hidden="true">
          <span>鱼</span>
        </div>
        <div>
          <p className="eyebrow">About this lab</p>
          <h1>Hi，我是小鱼。</h1>
          <p className="about-lead">
            电子信息背景的硕士生，正在专心学习神经网络基础与 LLM systems，
            也保留对多模态和具身智能的好奇心。
          </p>
        </div>
      </header>

      <div className="about-grid">
        <section>
          <h2>我在做什么</h2>
          <p>
            当前从 Karpathy 的 Neural Networks: Zero to Hero 出发，随后系统完成
            Stanford CS336。算法是每日小练习，RAG 评测暂缓，VLA 保留轻量探索。
          </p>
          <p>
            这个网站公开保留真实的学习轨迹：理解不稳、实验失败、任务顺延和路线调整都会出现。每个“已掌握”状态都需要概念与代码证据。
          </p>
        </section>
        <section className="about-principles">
          <h2>Learning principles</h2>
          <ol>
            <li>
              <span>01</span>每天只推进三个清晰重点。
            </li>
            <li>
              <span>02</span>看过不等于掌握，掌握需要验证。
            </li>
            <li>
              <span>03</span>代码、实验和复盘共同构成作品。
            </li>
          </ol>
        </section>
      </div>

      <div className="about-contact">
        <div>
          <p className="eyebrow">Find the work</p>
          <h2>所有公开代码都从 GitHub 开始。</h2>
        </div>
        <Link
          className="button button-primary"
          href="https://github.com/feng-nengyu"
        >
          GitHub Profile <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
