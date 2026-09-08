"use client";
import { useEffect, useState } from "react";
import { Markdown } from "./markdown";
const storageKey = "learning-lab:draft:v1";
interface Draft {
  title: string;
  body: string;
}
export function DraftEditor() {
  const [draft, setDraft] = useState<Draft>({ title: "", body: "" });
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("正在读取本机草稿…");
  const [mode, setMode] = useState<"write" | "preview" | "split">("split");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const value = JSON.parse(saved);
        if (
          !value ||
          typeof value.title !== "string" ||
          typeof value.body !== "string"
        )
          throw new Error("invalid draft");
        setDraft({ title: value.title, body: value.body });
        setStatus("已恢复本机草稿");
      } else setStatus("输入后自动保存在此浏览器");
    } catch {
      setStatus("未能读取本机草稿；新写的内容请及时导出。");
    }
    setReady(true);
  }, []);
  function update(patch: Partial<Draft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStatus("已自动保存到此浏览器");
    } catch {
      setStatus("保存失败，请复制或导出，避免丢失。");
    }
  }
  const markdown =
    (draft.title.trim() ? "# " + draft.title.trim() + "\n\n" : "") + draft.body;
  function download() {
    const url = URL.createObjectURL(
      new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download =
      (draft.title.trim() || "learning-lab-draft")
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
        .slice(0, 80) + ".md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("已导出 Markdown，草稿仍保留在本机");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("已复制。粘贴到我们的对话里，我来整理发布。");
    } catch {
      setStatus("复制未成功，可以选择文字复制，或导出 Markdown。");
    }
  }
  return (
    <section className="draft-workspace">
      <div className="draft-toolbar">
        <div className="filter-row" aria-label="编辑模式">
          {(
            [
              ["write", "写作"],
              ["split", "边写边看"],
              ["preview", "预览"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="draft-status" role="status">
          {status}
        </span>
      </div>
      <label className="draft-title">
        <span className="sr-only">草稿标题</span>
        <input
          aria-label="草稿标题"
          placeholder="给这个想法起个名字…"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          disabled={!ready}
        />
      </label>
      <div className={`editor-panes editor-mode-${mode}`}>
        {mode !== "preview" && (
          <label className="editor-source">
            <span className="pane-caption">MARKDOWN</span>
            <textarea
              aria-label="Markdown 正文"
              disabled={!ready}
              value={draft.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder={
                "今天我在想…\n\n## 一个问题\n\n用自己的话记录理解，也可以贴代码。\n\n支持 **加粗**、列表、链接、代码块和 $公式$。"
              }
            />
          </label>
        )}
        {mode !== "write" && (
          <div className="editor-preview">
            <span className="pane-caption">PREVIEW</span>
            {draft.body ? (
              <Markdown>{draft.body}</Markdown>
            ) : (
              <p className="preview-placeholder">
                想法不必完整。
                <br />
                写下第一句话，这里就会慢慢长出来。<span>✳</span>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="draft-actions">
        <p>
          草稿只留在当前浏览器，尚未发布。
          <br />
          整理好了，复制给我；也可以导出一份自己留存。
        </p>
        <div>
          <button
            className="button button-ghost"
            disabled={!ready || !markdown.trim()}
            onClick={download}
          >
            导出 .md
          </button>
          <button
            className="button button-primary"
            disabled={!ready || !markdown.trim()}
            onClick={copy}
          >
            复制给学习伙伴 ↗
          </button>
        </div>
      </div>
    </section>
  );
}
