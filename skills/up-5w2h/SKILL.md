---
name: up-5w2h
description: Applies the 5W2H analytical framework across all Object-Oriented Unified Process activities. Generates original, brainstorming-oriented questions tailored to each UP phase to surface hidden knowledge, clarify objectives, resolve ambiguities, and expand understanding before and during execution. Use with /skill:up-5w2h [activity-name].
---

# Skill: up-5w2h — 5W2H Analysis Framework for the Unified Process

## What Is 5W2H?

**5W2H** is a structured analytical framework that ensures every activity is fully understood before execution. It asks seven fundamental questions:

| Dimension | Question | Purpose |
|---|---|---|
| **What?** | What exactly needs to be done or decided? | Define the deliverable and scope with precision |
| **Why?** | Why is this necessary — what's the underlying purpose? | Surface hidden motivations and validate relevance |
| **Who?** | Who is involved, affected, responsible, or authoritative? | Identify all human factors including hidden stakeholders |
| **When?** | When does this happen — what triggers it, what deadlines exist? | Uncover time constraints, dependencies, and sequencing |
| **Where?** | Where does this apply — boundaries, contexts, environments? | Clarify scope limits and contextual boundaries |
| **How?** | How will this be accomplished — what method, process, or approach? | Challenge assumptions about execution strategy |
| **How Much?** | How much effort, risk, ambiguity, or complexity is involved? | Calibrate investment, set realistic expectations |

---

## Why 5W2H in the Unified Process?

OO analysis and design require assertive decisions at every step. Without structured questioning, teams frequently:
- Accept unstated assumptions that invalidate later artifacts
- Miss hidden stakeholders whose needs contradict visible requirements
- Design for the happy path while ignoring critical exception scenarios
- Build technically correct artifacts that answer the wrong question
- Underestimate complexity in areas where domain knowledge is shallow

**5W2H transforms each UP activity from a production task into a knowledge-creation event.**

---

## How to Use 5W2H in UP Activities

### When to Apply It

Apply 5W2H **at the start of each activity**, before producing any artifact. It serves as a mandatory warm-up that:

1. **Surfaces gaps** in available information
2. **Generates brainstorming** around non-obvious aspects
3. **Creates shared understanding** between analysts and stakeholders
4. **Identifies risks** before they become defects
5. **Calibrates scope** for realistic execution

### The 5W2H Loop

```
[Receive activity context]
        ↓
[Apply 5W2H — ask all 7 questions]
        ↓
[Identify which answers are unknown or unclear]
        ↓
[For each gap: brainstorm, research, or flag for stakeholder input]
        ↓
[Document insights as activity-specific context]
        ↓
[Proceed to execution with enriched understanding]
        ↓
[Revisit 5W2H if a blocker is encountered mid-execution]
```

### Question Quality Standards

5W2H questions in the UP context must be:

- **Original**: Never generic ("What needs to be done?") — always specific to the current system and activity
- **Brainstorming-oriented**: Open-ended, inviting multiple possible answers
- **Insight-generating**: Designed to reveal what isn't known, not just confirm what is
- **Doubt-resolving**: Targeting the most common failure points in that specific activity
- **Knowledge-expanding**: Connecting the immediate task to broader domain and design concerns

### What to Do With the Answers

| Answer Type | Action |
|---|---|
| **Clear and confident** | Proceed — document as validated assumption |
| **Clear but not obvious** | Document as key insight — may affect artifact structure |
| **Unclear but answerable** | Research domain knowledge, re-read vision/requirements |
| **Unclear and needs stakeholder** | Flag as open question — document and seek input |
| **Reveals contradiction** | Resolve before proceeding — contradictions grow if ignored |
| **Opens new scope** | Evaluate impact — may need to update catalog or backlog |

---

## 5W2H Templates by UP Activity

Each UP skill contains a pre-built 5W2H section with **7 original questions** tailored to that activity.

| Activity | Key 5W2H Focus |
|---|---|
| `up-vision` | Transformation depth, urgency triggers, hidden stakeholders |
| `up-requirements` | Tacit requirements, authority for conflicts, scope realism |
| `up-use-cases` | Exception knowledge, actor context shifts, expansion risk |
| `up-sequence-diagrams` | Implicit data flows, operation sequencing rationale |
| `up-conceptual-model` | Concept distinctness, lifecycle boundaries, rule hiding |
| `up-contracts` | Side effects, cascading consistency, formality calibration |
| `up-object-design` | Irreversible decisions, responsibility ownership, abstraction level |
| `up-interface-design` | Actual vs. stated workflows, edge-case users, proactive UX |
| `up-data-mapping` | Query patterns, inheritance trade-offs, lazy vs. eager loading |

---

## Standalone Usage

When invoked as `/skill:up-5w2h [activity-name]`, this skill:

1. Identifies the current UP activity from the provided name or UP state
2. Generates a full set of 7 original, context-specific 5W2H questions
3. Guides a structured Q&A session before the target activity begins
4. Produces a `5W2H-[activity].md` summary artifact capturing answers and open questions

```
up_save_artifact(
  path: "5w2h/5W2H-[activity-name].md",
  title: "5W2H Analysis — [Activity Name]",
  content: [structured Q&A with answers, insights, and open questions],
  phase: [current phase],
  activity: [current activity]
)
```

---

## Reference Template

See `templates/5w2h-template.md` for the base 5W2H analysis document structure.
