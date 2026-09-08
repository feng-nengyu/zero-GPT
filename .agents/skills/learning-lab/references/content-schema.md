# Learning Lab content schema

All dated values use `YYYY-MM-DD`. Slugs are lowercase ASCII with hyphens.

## Common frontmatter

```yaml
title: Human-readable title
date: 2026-09-04
summary: One concise sentence used in cards and metadata.
track: karpathy | cs336 | algorithms | rag-eval | vla | meta
tags: [tag-one, tag-two]
status: planned | learning | checking | mastered | published
mastery: learning | checking | mastered
evidence: []
```

`mastery` and `evidence` are required for technical notes. Evidence is a list of short typed strings. Only entries beginning with `conceptual:` and `practical:` count toward mastery; inputs and prepared scaffolds may use labels such as `conceptual-input:` and `practical-scaffold:`, but do not pass the gate.

A `mastered` note must contain at least one `conceptual:` item and one `practical:` item. Example:

```yaml
evidence:
  - "conceptual: independently explained why saturation changes local gradients"
  - "practical: ran the initialization-scale experiment and interpreted its statistics"
```

## Daily log

Daily frontmatter adds exactly three goals:

```yaml
goals:
  - id: main
    lane: main
    text: Concrete next action
    status: planned
    carried_from:
    evidence:
  - id: algorithm
    lane: algorithm
    text: Concrete next action
    status: planned
    carried_from:
    evidence:
  - id: output
    lane: output
    text: Concrete next action
    status: planned
    carried_from:
    evidence:
```

Allowed goal status values are `planned`, `in-progress`, `done`, and `carried`.

## Body conventions

- Notes: problem, concept map, key ideas, minimal code or experiment, pitfalls, mastery check, sources.
- Daily logs: context, work record, assessment, reflection, next action.
- Blogs: thesis, evidence from the week, what changed, next week.
- Projects: problem, contribution, stack, measurable result, links, next milestone.

## Reading shelf and thinking prompts

`explore.yml` contains `checked` (link verification date), `readings` and `fragments`. These are assistant-curated references, not personal notes or proof of learning. Each reading has a unique `id`, `title`, `author`, `type` (博客/论文/教程/项目), `topic`, `minutes` (suggested first browse, not full reading time), absolute HTTPS `url`, `summary` and `start`. Each fragment has `id`, `topic`, `question`, `answer`, `source` and `source_title`.

`state.yml.question` stores one current `title`, `prompt`, and a `references` array with `title`, HTTPS `url`, and a short `hint`. Show the prompt first, keep references in an expandable section, and do not update mastery from opening a reference.

`state.yml.break` and `roadmap.yml.break` must agree on `start`, `end` and `resume`; `tentative` indicates a learner-proposed approximate window. Current assumption: 2026-09-19 through 2026-09-29, resume 2026-09-30. New learner instructions supersede this default.

`roadmap.yml.sprint` contains the compact near-term plan: title, capacity, rhythm, target, checkpoints (period/title/result/stretch), and fallback. Dates and hours are estimates, not completed work. Do not fabricate daily entries for unused dates. The homepage date and all three goals must match the current daily file.

The browser's draft (`learning-lab:draft:v1`) and focus checkboxes are local-only convenience state. They do not publish, sync across devices, or count as learning evidence. Keep publication through the conversation and repository workflow. A note with `status: planned` must display as planned even when its required mastery field is `learning`.

## Dated study plan

`study-plan.yml` is a prospective schedule, not a daily log. It stores an `updated` date, a `version` for local checkbox keys, timing/boundary/hardware notes, a dictionary of HTTPS `sources`, `weeks`, ordered `days`, and the CS336 `curriculum`.

Each day has `date`, `week`, `title`, `outcome`, total `minutes`, ordered `blocks`, and one `question` with source IDs. Each block has a unique daily `id`, `kind` (watch/read/code/check/algorithm/output), positive integer `minutes`, `title`, concrete `task`, completion criterion `done` (text, never a completion flag), and `sources` IDs. Every day contains main learning plus exactly one algorithm and one output block. Budgets sum to the displayed day total, at most 300 minutes, excluding exercise and ordinary breaks. No dated task falls in the protected rest window.

The curriculum covers five assignments plus guest lectures, with lecture grouping, estimated period/budget, action sequence, completion criteria and official URL. All estimates and candidate sources remain plans until the learner provides evidence. The roadmap and CS336 map must agree with this schedule.

The daily page selects the current Shanghai date when it exists in the plan; date hashes allow previews. During the break the default view contains no tasks. Outside scheduled dates it explicitly shows an old plan for review rather than claiming it is today's work. Local steps use `learning-lab:steps:<version>:<date>`; a content revision may deliberately change the version when steps change meaning. These never write public completion or mastery.
