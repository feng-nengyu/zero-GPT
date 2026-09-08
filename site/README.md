# 小鱼 · Learning Lab

The public learning site is generated from Markdown, YAML, existing notes, and verified learning evidence.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Before publishing, run:

```bash
npm run typecheck
npm run build
```

The static export is written to `out/`. GitHub Actions deploys that directory to GitHub Pages on pushes to `main`.

Content lives in `content/`; existing repository notes in `../notes/` are included as legacy notes without rewriting them.

## Everyday use

- `/`: learning desk; exactly three public focuses, one thinking question, personal writing and curated reading.
- `/daily/`: current focuses, expandable reference links and real dated logs.
- `/explore/`: topic filters, search, random reading picks and sourced knowledge fragments, maintained in `content/explore.yml`.
- `/write/`: Markdown draft with math/code preview, local autosave, copy for conversation and .md export. Drafts are not uploaded or published; clearing browser storage removes them.
- Notes, blogs and projects have searchable content/tag indexes. Planned material is displayed as planned.

Updates normally arrive through conversation: edit the appropriate Markdown/YAML, validate, build, then publish public-safe material. The static site has no authenticated content-writing backend. Checkboxes are saved per planning date in this browser and do not change repository state or mastery.

The break dates and current three goals are checked for consistency at build time. Keep `state.yml`, the latest daily entry and `roadmap.yml` aligned; preserve historical logs. See the project skill's content schema for fields.

The build normalizes nested Next.js segment filenames emitted on Windows to the flat URLs the browser expects. Linux exports are already flat. A regression test covers dynamic-route payloads; the normalizer only copies generated artifacts inside out/.

每日详细清单保存在 content/study-plan.yml：按日期、时间预算、课程链接、动手与检查编排。未来清单不生成学习日志；本机勾选不更新公开进度。CS336 五个作业的可展开路线也来自此文件。
