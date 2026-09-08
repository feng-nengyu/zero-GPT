"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CurrentState } from "@/lib/content";
import { StatusPill } from "./status-pill";
const links: Record<string, string> = {
  main: "/daily#study-main",
  algorithm: "/daily#study-algorithm",
  output: "/daily",
};
export function FocusBoard({ state }: { state: CurrentState }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(state.current.date);
  const key = `learning-lab:focus:${state.current.date}`;
  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(saved))
        setChecked(saved.filter((x): x is string => typeof x === "string"));
    } catch {
      setMessage("本机暂时无法保存勾选，公开记录仍可查看。");
    }
  }, [key]);
  const rest = date >= state.break.start && date <= state.break.end;
  function toggle(id: string) {
    const next = checked.includes(id)
      ? checked.filter((x) => x !== id)
      : [...checked, id];
    setChecked(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setMessage("已保存到本机；告诉我实际进展后，再更新公开记录。");
    } catch {
      setMessage("勾选未能保存，刷新后可能丢失。");
    }
  }
  return (
    <section className="focus-board">
      <div className="block-title">
        <div>
          <p className="eyebrow">A SMALL STEP TODAY</p>
          <h2>{rest ? "安心休息，去跑步吧" : "今天，先做好这三件事"}</h2>
        </div>
        <span className="date-stamp">
          {state.current.date.slice(5).replace("-", " / ")}
        </span>
      </div>
      <p className="focus-intent">
        {rest ? state.notice.text : state.today.intent}
      </p>
      {date !== state.current.date && !rest && (
        <p className="snapshot-note">
          这是 {state.current.date} 最近一次安排。逐日清单已排到
          9.18，打开每日待办查看当天计划。
        </p>
      )}
      {!rest && (
        <ol className="desk-focus-list">
          {state.today.goals.map((goal, i) => {
            const done = goal.status === "done";
            const local = checked.includes(goal.id);
            return (
              <li
                key={goal.id}
                className={done || local ? "focus-complete" : ""}
              >
                <input
                  type="checkbox"
                  checked={done || local}
                  disabled={done}
                  onChange={() => toggle(goal.id)}
                  aria-label={`本机标记：${goal.lane}`}
                />
                <div>
                  <div className="focus-label">
                    <span>
                      0{i + 1} / {goal.lane}
                    </span>
                    <StatusPill status={goal.status} />
                  </div>
                  <Link href={links[goal.id] || "/daily"}>{goal.text}</Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="focus-foot">
        <span aria-live="polite">
          {message || "勾选仅保存在本机，不会变更公开进度或掌握状态。"}
        </span>
        <Link href="/daily">看详细学习清单 ↗</Link>
      </div>
    </section>
  );
}
