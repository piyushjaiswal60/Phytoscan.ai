# PROMPT.md — prompts for Claude Code

## Setup (once)
1. Copy `CLAUDE.md`, `PLAN.md` and this file into the ROOT of your plant-disease repo.
2. Open a terminal in that folder and run `claude`.
3. Make sure the repo is committed first (`git status` clean) so you can always roll back.

---

## 1) Kickoff prompt (paste this first)

```
Read CLAUDE.md and PLAN.md fully before doing anything.

We are upgrading this existing Plant Disease CNN project into a full-stack app:
FastAPI backend -> React frontend -> Docker -> manual smoke test -> pytest -> GitHub Actions CI -> CD + deployment.

Start with Step 0 only (audit, no code changes). Inspect the repo and write AUDIT.md covering:
- model files (format, size, input shape, preprocessing used in training)
- class labels and how they map to model outputs
- the existing Streamlit app and how it loads/uses the models
- Python and TensorFlow versions and any compatibility risks
- your proposed folder structure and how we should store the model files

Do not modify any existing files. When AUDIT.md is ready, summarise it in 10 lines, list any questions you have for me, and stop. Wait for me to say "continue".
```

---

## 2) Continue prompt (paste after you approve each step)

```
Continue with Step <N> from PLAN.md.

Rules: create branch step-<N>-<name>, make small commits, run every command in "Done when" and show me the real output. Do not start Step <N+1>. When finished, append the LEARNING.md entry, summarise what changed, list anything I should double-check, and stop.
```

Replace `<N>`, `<name>` and `<N+1>` each time.

---

## 3) "Something broke" prompt

```
Step <N> is failing. Here is the exact error output:

<paste the full error>

Do not guess. First reproduce the failure, then explain the root cause in plain language, then propose a minimal fix. Do not skip or weaken any test to make it pass. After fixing, re-run the full "Done when" checks for this step and show the real output. Add a short note to LEARNING.md about what went wrong and why.
```

---

## 4) "Explain it to me" prompt (use before interviews)

```
I need to explain this project in an interview. Walk me through <backend / frontend / Docker setup / CI pipeline / deployment> as if I'm the author: the design choices, the alternatives we rejected, trade-offs, and what could fail in production. Then ask me 5 interview-style questions one at a time and give feedback on my answers.
```

---

## 5) Final resume prompt (only after Step 8)

```
Based ONLY on what is verified in this repo (real test results, real CI status, real live URL, real coverage), draft 3-4 resume bullets for this project. Use exact numbers from our runs. Mark anything you could not verify as [UNVERIFIED] and do not include it in the bullets.
```

---

## Tips
- If Claude Code starts doing several steps at once, tell it: "Stop. Follow PLAN.md one step at a time."
- If a step goes badly, `git checkout main` and delete the step branch; nothing else is affected.
- Run `/clear` between steps if the session gets long. CLAUDE.md is re-read automatically, so the rules persist.
