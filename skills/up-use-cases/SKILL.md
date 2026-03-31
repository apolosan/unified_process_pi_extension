---
name: up-use-cases
description: Expands Object-Oriented Unified Process use cases into detailed specifications with main flow, variants, exceptions, pre- and post-conditions. Follows CRUD, report, and functional templates from Jacobson's UP. Generates docs/up/03-use-cases/UC-NN-name.md.
---

# Skill: up-use-cases — Use Case Expansion

## Objective

You are the **UP USE CASE ANALYST**. Your role is to expand each Use Case from the catalog into a complete detailed specification, following Unified Process standards based on Jacobson.

---

## Required Inputs

- `docs/up/02-use-case-list.md` (load via `up_load_artifact`)
- Templates at `templates/crud-template.md`, `templates/report-template.md`, `templates/functional-template.md`

---

## General Expansion Rules

### Step Notation
- **`[IN]`** — Action from the **actor → system** (data entry, command, selection)
- **`[OUT]`** — Response from the **system → actor** (display, confirmation, result)
- Steps are numbered: `1.`, `2.`, `3.`
- Variants are numbered: `1.1 Variant 'insert'`
- Exceptions use alphanumeric notation: `1.1.1a` (exception of step 1.1.1)

### Pre-conditions vs Exceptions
- **Pre-condition**: fact **guaranteed to be true** before the UC starts (no need to verify)
- **Exception**: situation that may or may not occur during execution (must be handled)

---

## Step 0: 5W2H Analysis (Mandatory)

Before expanding any use case, apply 5W2H to each UC you are about to write. These questions are calibrated for the use case expansion activity and intentionally target the most common failure modes in UC writing.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What are the non-obvious exception paths that only a highly experienced domain user — someone who has seen the system fail in production — would know about and that standard requirements elicitation would never surface? |
| **Why?** | Why does each use case exist as a *separate* entity — could any two be merged without losing information, or split without creating artificial boundaries that confuse implementers? |
| **Who?** | Who are the actors that appear only in exceptional flows but are critical for the system to behave correctly — and have they been included in the actors catalog? |
| **When?** | When does an actor's expected behavior change based on context — time of day, system load, their own role, or the system's current state — and do those context shifts appear in the UC? |
| **Where?** | Where do two or more use cases overlap in scope, potentially creating inconsistency if they are designed independently without shared constraints or business rules? |
| **How?** | How much detail is appropriate for this UC at this stage — where does expanding further generate more questions than it answers, and where does stopping early create downstream ambiguity? |
| **How Much?** | How much effort will each use case expansion require relative to the risk it carries — which UCs have the highest probability of needing a major revision after stakeholder review? |

> 📌 **For each question**: answers that reveal uncertainty are especially valuable — they identify where to focus stakeholder validation before committing to a UC structure.

---

## Step-by-Step Execution

### 1. Load the Use Case Catalog

```
up_load_artifact(path: "02-use-case-list.md")
```

### 2. Identify the Appropriate Template for Each UC

| Stereotype | Template | Characteristics |
|---|---|---|
| `<<CRUD>>` | crud-template.md | 4 variants: insert, read, update, delete |
| `<<rep>>` | report-template.md | [IN] parameters + [OUT] formatted data |
| `[functional]` | functional-template.md | Main flow with variants and exceptions |

### 3. Expand CRUD Use Cases

A CRUD UC has **4 variants** (not alternative flows — they are 4 distinct operations):
- **Insert Variant**: user provides data, system validates and inserts
- **Read Variant**: system presents list, user selects, system displays details
- **Update Variant**: includes all Read Variant steps + user modifies data
- **Delete Variant**: system presents list, user selects and confirms deletion

Typical CRUD exceptions:
- Unique identifier violation (CPF already registered, duplicate code)
- Structural rule violation on deletion (object has dependents)
- Business rule violation on insert/update

### 4. Expand Report Use Cases

Simple structure:
1. `[IN]` The user provides filter parameters (period, category, etc.)
2. `[OUT]` The system displays data grouped by X and sorted by Y

### 5. Expand Functional Use Cases

For complex business processes:
- Main flow with all steps numbered
- Variants for alternative paths
- Numbered exceptions with return to the correct step

### 6. Save Each Expanded UC

```
up_save_artifact(
  path: "03-use-cases/UC-NN-use-case-name.md",
  title: "UC-NN: Use Case Name",
  content: [complete content],
  phase: "elaboration",
  activity: "use-cases"
)
```

### 7. Update State

```
up_update_state(updates: '{"completedActivities":["vision","requirements","use-cases"]}')
```

---

## Quality Criteria

- Every step must have exactly one responsible party: actor or system
- Exceptions must be realistic and handleable — do not list impossible scenarios
- The Update Variant **MUST** include the steps of the Read Variant (natural navigation flow)
- Success post-conditions must be verifiable (observable system state)
- Avoid implementation jargon (no mention of databases, SQL, etc.)

---

## Reference Templates

- `templates/crud-template.md` — CRUD UC with 4 variants
- `templates/report-template.md` — Report UC
- `templates/functional-template.md` — Functional UC
