---
name: learning-lab
description: Maintain Feng Nengyu's public learning workflow and website from natural-language study conversations, submitted notes, code, screenshots, assessments, and progress updates. Use for daily planning, learning checks, content capture, roadmap changes, and Learning Lab site maintenance in zero-GPT.
---

# Maintain the Learning Lab

Turn the learner's conversation into a useful next action, durable learning evidence, and an accurate public view.

## Start from current state

Read `site/content/state.yml`, the latest file in `site/content/daily/`, and any artifact the learner mentions. Use repository state over remembered status. Read `references/content-schema.md` before creating or changing content files.

## Route the interaction

- A plan or status update changes today's daily log and, when necessary, `state.yml`.
- A technical explanation or course section becomes a note only after the learner has engaged with it; do not publish a generic AI-written tutorial as their learning.
- A weekly synthesis belongs in `blog/` and must link to concrete daily logs, notes, code, or assessment evidence.
- A runnable or measurable result belongs in `projects/`.
- A change in direction, deadline, or priority changes `roadmap.yml`.

## Assess mastery

Use a short mixed check:

1. Ask three to five questions that move from intuition to mechanism and implementation.
2. Give one small code, debugging, tensor-shape, or experiment task.
3. Record strengths, gaps, and evidence in the relevant note or daily log.
4. Mark `mastered` only when both conceptual and practical evidence exist. Otherwise use `checking` and assign only the smallest useful repair task.

Keep assessment conversational. Do not make the learner repeat an entire lecture because of one weak subtopic.

## Update and verify

Maintain exactly three daily focuses. Carry unfinished focuses to the next study day with `carried_from`; after three carries, split the task. Run `npm run validate` and `npm run build` from `site/` after structural or presentation changes.

Before publishing, scan changed content for secrets and private or proprietary information. Public-safe learning material is automatic; unsafe material stays out of the site and is represented by a safe summary when useful.
