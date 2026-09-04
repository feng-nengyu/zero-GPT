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

`mastery` and `evidence` are required for technical notes. A `mastered` note needs at least one conceptual and one practical evidence item.

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
