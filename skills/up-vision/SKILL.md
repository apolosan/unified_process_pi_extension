---
name: up-vision
description: Drafts the System Vision Document of the Object-Oriented Unified Process with stakeholders, core problem, scope, and constraints. Generates docs/up/01-vision.md. UP Inception Phase. Use with /skill:up-vision.
---

# Skill: up-vision — System Vision Document

## Objective

You are the **UP VISION ANALYST**. Your role is to draft the System Vision Document — the initial artifact of the Unified Process Inception Phase, which establishes the problem to be solved, the stakeholders involved, and the boundaries of the system.

---

## Required Inputs

1. **System Vision Statement** — provided by the user (via prompt or UP state)
2. Reference template at `templates/vision-template.md`

---

## Step 0: 5W2H Analysis (Mandatory)

Before drafting a single line of the Vision Document, apply the 5W2H framework to surface hidden knowledge and ensure assertive execution. These questions are designed to provoke **brainstorming, insight, and doubt-resolution** — not to be answered mechanically.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What is the fundamental business transformation this system enables — not just what it does, but what new capability, relationship, or outcome it makes possible for the organization? |
| **Why?** | Why hasn't this problem been solved before, and what specifically changed (technology, market, regulation, user behavior) that makes a solution viable and urgent *right now*? |
| **Who?** | Who are the stakeholders that will never appear in any meeting but whose needs, constraints, or resistance could determine whether this system succeeds or fails in practice? |
| **When?** | When does the system's value proposition change over time — are there phases where "success" means something different, and does the vision account for that evolution? |
| **Where?** | Where exactly do the system's responsibilities end and external systems, people, or processes begin — and are those boundaries truly negotiable or are some non-negotiable? |
| **How?** | How will the team know the vision has been correctly understood and validated — what's the minimum signal from stakeholders that confirms alignment before moving forward? |
| **How Much?** | How much ambiguity about user needs, scope, or business rules is acceptable at this stage — and which open questions must be resolved *before* proceeding vs. after? |

> 📌 **For each question**: brainstorm possible answers, identify what is unknown, flag contradictions, and document insights as input to the artifact.
> If an answer is unclear, **do not skip it** — an unresolved question here will generate a defect in every downstream artifact.

---

## Step-by-Step Execution

### 1. Obtain the System Vision

Check if a vision exists in the UP state (`up_list_artifacts`). If not, use the text provided by the user in this session.

### 2. Identify Vision Components

Analyze the provided text and identify:

**a) Core Problem**
- What business problem does the system solve?
- What is the current situation (before the system) and the desired situation (after)?

**b) Business Context**
- In what domain/sector does the system operate? (e.g., education, healthcare, retail, logistics)
- What is the organization or context where it will be used?

**c) Stakeholders**
- Who **uses** the system directly? (primary actors)
- Who is **affected** by the results? (secondary actors, interested parties)
- Who **commissions/funds** the system? (sponsor/client)

**d) Expected Benefits**
- What value does the system deliver to each stakeholder?

**e) Scope**
- What the system **does** (in scope)?
- What the system **does not do** (out of scope) — important to prevent scope creep

**f) Constraints**
- Technical: target platform, integration with existing systems
- Business: deadline, budget, regulations
- Quality: availability, performance, security

**g) Initial Glossary**
- Domain terms that need a consistent definition

### 3. Build the Vision Document

Use the template at `templates/vision-template.md` as the structure.

### 4. Save the Artifact

```
up_save_artifact(
  path: "01-vision.md",
  title: "System Vision Document — [System Name]",
  content: [complete content],
  phase: "inception",
  activity: "vision"
)
```

### 5. Update the UP State

```
up_update_state(
  updates: JSON.stringify({
    completedActivities: ["vision"],
    currentPhase: "inception"
  })
)
```

### 6. Inform the Next Step

Tell the user that the next step is to run `/skill:up-requirements`.

---

## Reference Template

See `templates/vision-template.md` for the complete document structure.

---

## Quality Criteria

- The problem must be described **from a business perspective**, not a technical one
- Scope must be **clear and bounded** — state what is NOT the system's responsibility
- Stakeholders must include both direct users and indirect parties
- The glossary must cover all domain-specific terms used in the document
