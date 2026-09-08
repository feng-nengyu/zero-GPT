"use client";
import { useState } from "react";
import type { Fragment } from "@/lib/explore-types";
import { LabIcon } from "./lab-icon";
export function FragmentCard({ fragments }: { fragments: Fragment[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const item = fragments[index];
  if (!item) return null;
  function shuffle() {
    setIndex(
      (i) =>
        (i + 1 + Math.floor(Math.random() * (fragments.length - 1))) %
        fragments.length,
    );
    setOpen(false);
  }
  return (
    <section className="fragment-card">
      <div className="mini-heading">
        <span>✦ 一口知识</span>
        <button
          onClick={shuffle}
          disabled={fragments.length < 2}
          aria-label="换一张知识卡片"
        >
          <LabIcon name="shuffle" size={16} /> 换一张
        </button>
      </div>
      <span className="fragment-topic">{item.topic}</span>
      <div aria-live="polite">
        <h3>{item.question}</h3>
        {open && (
          <div className="fragment-answer">
            <p>{item.answer}</p>
            <a href={item.source} target="_blank" rel="noreferrer">
              {item.source_title} ↗
            </a>
          </div>
        )}
      </div>
      <button
        className="fragment-reveal"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "收起解释 ↑" : "展开一点点 →"}
      </button>
      <p className="micro-copy">助手整理 · 随手探索，不计入掌握记录</p>
    </section>
  );
}
