"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CurrentState } from "@/lib/content";
import {
  minutesLabel,
  type StudyBlock,
  type StudyDay,
  type StudyPlan,
} from "@/lib/study-plan";

const kindLabels: Record<StudyBlock["kind"], string> = {
  watch: "看课",
  read: "阅读 / 准备",
  code: "动手",
  check: "检查 / 整理",
  algorithm: "算法",
  output: "公开产出",
};
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(date + "T12:00:00+08:00"));
}
function weekLabel(label: string, start: string, today: string) {
  const monday = (date: string) => {
    const value = new Date(date + "T00:00:00Z");
    return value.valueOf() / 86400000 - ((value.getUTCDay() + 6) % 7);
  };
  const delta = monday(start) - monday(today);
  const prefix =
    delta === 0
      ? "本周 · "
      : delta === 7
        ? "下周 · "
        : delta === -7
          ? "上周 · "
          : "";
  return prefix + label.replace(/^(本周|下周) · /, "");
}
function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date());
}
function References({ ids, plan }: { ids: string[]; plan: StudyPlan }) {
  return (
    <div className="study-links">
      {ids.map((id) => {
        const ref = plan.sources[id];
        return (
          <a href={ref.url} key={id} target="_blank" rel="noreferrer">
            {ref.title} ↗
          </a>
        );
      })}
    </div>
  );
}
function DayChecklist({ day, plan }: { day: StudyDay; plan: StudyPlan }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const key = `learning-lab:steps:${plan.version}:${day.date}`;
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(saved))
        setChecked(
          saved.filter(
            (id): id is string =>
              typeof id === "string" && day.blocks.some((b) => b.id === id),
          ),
        );
    } catch {
      setMessage("本机暂时无法保存勾选，你仍可以照着清单学习。");
    }
    setReady(true);
  }, [key, day.blocks]);
  function toggle(id: string) {
    const next = checked.includes(id)
      ? checked.filter((x) => x !== id)
      : [...checked, id];
    setChecked(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setMessage("已保存到本机；把结果发来后，我再整理公开学习记录。");
    } catch {
      setMessage("本次勾选未能保存，刷新后可能丢失。");
    }
  }
  const groups = [
    {
      id: "main",
      label: "主线学习",
      blocks: day.blocks.filter(
        (b) => !["algorithm", "output"].includes(b.kind),
      ),
    },
    {
      id: "algorithm",
      label: "算法基础",
      blocks: day.blocks.filter((b) => b.kind === "algorithm"),
    },
    {
      id: "output",
      label: "公开产出",
      blocks: day.blocks.filter((b) => b.kind === "output"),
    },
  ];
  return (
    <>
      <button
        className="study-question-jump"
        type="button"
        onClick={() =>
          document
            .getElementById("study-question")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        跳到本日思考题 ↓
      </button>
      <div className="study-budget">
        {groups.map((g, i) => (
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(`study-${g.id}`)
                ?.scrollIntoView({ behavior: "smooth" })
            }
            key={g.id}
          >
            <span>
              0{i + 1} / {g.label}
            </span>
            <strong>
              {minutesLabel(g.blocks.reduce((sum, b) => sum + b.minutes, 0))}
            </strong>
            <small>
              {g.id === "main"
                ? "看课 → 动手 → 检查"
                : g.id === "algorithm"
                  ? "一道小题，边学边补"
                  : "发给我几句话就好"}
            </small>
          </button>
        ))}
      </div>
      <div className="study-progress">
        <span>
          本机勾选 {checked.length} / {day.blocks.length} 步
        </span>
        <progress
          max={day.blocks.length}
          value={checked.length}
          aria-label="本机步骤完成情况"
        />
        <span>计划预算 {minutesLabel(day.minutes)}</span>
      </div>
      <p className="study-save-note" aria-live="polite">
        {message || "勾选只作本机备忘，不代表公开完成、已掌握或实际学习时长。"}
      </p>
      {groups.map((group) => (
        <section
          className="study-group"
          id={`study-${group.id}`}
          key={group.id}
        >
          <h3>
            {group.label}
            <span>
              {minutesLabel(
                group.blocks.reduce((sum, b) => sum + b.minutes, 0),
              )}
            </span>
          </h3>
          <ol className="study-steps">
            {group.blocks.map((block, i) => (
              <li
                className={checked.includes(block.id) ? "step-checked" : ""}
                key={block.id}
              >
                <div className="step-rail">
                  <input
                    type="checkbox"
                    aria-label={`本机完成：${block.title}`}
                    checked={checked.includes(block.id)}
                    disabled={!ready}
                    onChange={() => toggle(block.id)}
                  />
                </div>
                <div className="step-content">
                  <div className="step-title">
                    <h4>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {block.title}
                    </h4>
                    <span className={`step-kind kind-${block.kind}`}>
                      {kindLabels[block.kind]} · {block.minutes} 分钟
                    </span>
                  </div>
                  <p>{block.task}</p>
                  <div className="step-result">
                    <strong>做到这里</strong>
                    <span>{block.done}</span>
                  </div>
                  <References ids={block.sources} plan={plan} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section className="study-question" id="study-question">
        <span className="eyebrow">ONE QUESTION · 配套思考</span>
        <h3>{day.question.prompt}</h3>
        <details>
          <summary>想过了，打开参考继续学 ↗</summary>
          <References ids={day.question.sources} plan={plan} />
          <p>
            先发自己的解释，再看是否需要一个小实验。打开资料与勾选步骤都不会变更掌握状态。
          </p>
        </details>
        <Link className="text-link" href="/write">
          记下我的解释 →
        </Link>
      </section>
    </>
  );
}
export function StudyPlanner({
  plan,
  state,
}: {
  plan: StudyPlan;
  state: CurrentState;
}) {
  const [selected, setSelected] = useState(state.current.date);
  const [today, setToday] = useState(state.current.date);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const date = localDate();
    setToday(date);
    function syncHash() {
      const hash = window.location.hash.slice(1);
      if (plan.days.some((d) => d.date === hash)) {
        setSelected(hash);
        setPreview(true);
      } else {
        setSelected(
          plan.days.some((d) => d.date === date) ? date : state.current.date,
        );
        setPreview(false);
      }
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [plan.days, state.current.date]);
  const day = plan.days.find((d) => d.date === selected) || plan.days[0];
  const week = plan.weeks.find((w) => w.id === day.week)!;
  const rest = today >= state.break.start && today <= state.break.end;
  const listedToday = plan.days.some((d) => d.date === today);
  function selectDay(date: string) {
    setSelected(date);
    setPreview(true);
    window.history.replaceState(null, "", "#" + date);
  }
  function goToday() {
    setSelected(listedToday ? today : state.current.date);
    setPreview(false);
    window.history.replaceState(null, "", window.location.pathname);
  }
  return (
    <section className="study-planner">
      <div className="study-weeks" aria-label="选择学习周">
        {plan.weeks.map((w) => (
          <button
            type="button"
            key={w.id}
            aria-pressed={w.id === week.id}
            onClick={() =>
              selectDay(plan.days.find((d) => d.week === w.id)!.date)
            }
          >
            <span>
              {w.period} ·{" "}
              {minutesLabel(
                plan.days
                  .filter((d) => d.week === w.id)
                  .reduce((sum, d) => sum + d.minutes, 0),
              )}
            </span>
            <strong>
              {weekLabel(
                w.label,
                plan.days.find((d) => d.week === w.id)!.date,
                today,
              )}
            </strong>
            <small>{w.target}</small>
          </button>
        ))}
      </div>
      <div className="study-daybar">
        <div className="study-days" aria-label="选择学习日期">
          {plan.days
            .filter((d) => d.week === day.week)
            .map((d) => (
              <button
                type="button"
                key={d.date}
                aria-pressed={d.date === selected}
                title={d.title}
                onClick={() => selectDay(d.date)}
              >
                <span>
                  {new Intl.DateTimeFormat("zh-CN", {
                    weekday: "short",
                    timeZone: "Asia/Shanghai",
                  }).format(new Date(d.date + "T12:00:00+08:00"))}
                </span>
                <strong>{d.date.slice(5).replace("-", " / ")}</strong>
                <small>
                  {minutesLabel(d.minutes)}
                  {d.date === today ? " · 今天" : ""}
                </small>
              </button>
            ))}
        </div>
        <button type="button" className="study-today" onClick={goToday}>
          回到今天 ↶
        </button>
      </div>
      <p className="study-week-note">{week.note}</p>
      {rest && (
        <aside className="study-rest">
          <strong>☁ 今天安心休息，去跑步吧。</strong>
          <p>{state.notice.text}</p>
          <span>上方可以预览清单，休息期没有今日任务或逾期。</span>
        </aside>
      )}
      {!listedToday && !rest && !preview && (
        <p className="snapshot-note">
          今天是 {today}，尚未细排当天清单。下面是 {day.date}{" "}
          的计划回顾；发来进展后再安排下一天，不自动累积待办。
        </p>
      )}
      {(!rest || preview) && (
        <article className="study-day" aria-label="当日详细清单">
          <header className="study-day-heading">
            <div>
              <p className="eyebrow">
                {dateLabel(day.date)} ·{" "}
                {day.date === today ? "今日计划" : "计划预览"} · 待本人执行 /
                反馈
              </p>
              <h2>{day.title}</h2>
              <p>{day.outcome}</p>
            </div>
            <div className="study-total">
              <strong>{minutesLabel(day.minutes)}</strong>
              <span>学习预算</span>
            </div>
          </header>
          <DayChecklist key={plan.version + day.date} day={day} plan={plan} />
        </article>
      )}
      <details className="study-plan-notes">
        <summary>时间怎么算，以及本周的完成边界</summary>
        <p>{plan.timing_note}</p>
        <p>{plan.hardware}</p>
        <p>{plan.boundary}</p>
        <References ids={["syllabus", "cs"]} plan={plan} />
      </details>
    </section>
  );
}
