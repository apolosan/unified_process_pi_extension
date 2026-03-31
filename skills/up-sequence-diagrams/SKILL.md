---
name: up-sequence-diagrams
description: Creates System Sequence Diagrams (SSD) for the Object-Oriented Unified Process. Identifies system events and operations from expanded use cases. Uses Mermaid sequenceDiagram with actor and system lifelines. Generates docs/up/04-dss/ and docs/up/04-system-operations.md.
---

# Skill: up-sequence-diagrams — System Sequence Diagrams

## Objective

You are the **UP INTERACTION ANALYST**. Your role is to create System Sequence Diagrams (SSD) — visual representations of the sequence of events between actors and the system, identifying the **system operations** that will be detailed in contracts.

---

## Core Concepts

### System Events vs System Operations
- **System event**: a `[IN]` step in a UC — an actor action that sends data/command to the system
- **System operation**: the method that the system must implement to process the event
- Each `[IN]` step generates an arrow in the SSD and an operation in the operations list

### Stateful vs Stateless Strategy
- **Stateful**: the system maintains context between operations (session, in-memory state) — e.g., `startPurchase()` → `addItem()` → `finalizePurchase()`
- **Stateless**: each operation is self-contained and receives all required data — e.g., `createOrder(customerId, items, paymentMethod)`

---

## Required Inputs

- All UCs in `docs/up/03-use-cases/` (load via `up_load_artifact`)
- Template at `templates/dss-template.md`

---

## Step 0: 5W2H Analysis (Mandatory)

Apply 5W2H before drawing the first SSD. Sequence diagrams encode implicit decisions about data flow and system responsibility — these questions force those decisions to be made explicitly.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What data flows between actors and the system are *implicit* in the use case — information that is clearly needed for the operation to succeed but that was never explicitly mentioned in any UC step? |
| **Why?** | Why does the current operation sequence exist in this exact order — are there steps that could be parallelized, eliminated, or reordered without affecting the business outcome? |
| **Who?** | Who initiates each system event in the SSD, and are there cases where the initiating actor can change based on context (e.g., automated system vs. human, role elevation, delegation)? |
| **When?** | When does the system need to act *proactively* — sending information, triggering events, or enforcing timeouts — rather than waiting passively for an actor's action? |
| **Where?** | Where in the operation sequence do the most complex validation rules apply — and are those validations modeled as operations, pre-conditions, or exception flows? |
| **How?** | How will the choice of stateful vs. stateless strategy impact session management, scalability, and error recovery in real deployment conditions? |
| **How Much?** | How many system operations per use case is reasonable before the design suggests the use case should be split or the operation model refactored? |

> 📌 **For each question**: unresolved answers here directly translate into missing operations, wrong parameter lists, or incorrect contracts downstream.

---

## Step-by-Step Execution

### 1. Load the Use Cases

For each relevant UC (prioritize functional UCs; simple CRUDs may have simplified SSDs).

### 2. Identify System Operations

For each UC, go through the steps:
- `[IN]` steps → each generates an **operation call** in the SSD
- Identify: operation name + parameters + expected return type

Operation naming convention:
- Verbs in camelCase: `startPurchase()`, `addItem()`, `finalizeOrder()`
- Parameters reflect what the actor provides: `createCustomer(name: String, ssn: SSN, ...)`

### 3. Create the SSD in Mermaid

Use the `sequenceDiagram` format:

```mermaid
sequenceDiagram
  actor ActorName
  participant :System

  ActorName->>:System: operationName(param1, param2)
  :System-->>ActorName: result

  opt [exception condition]
    :System-->>ActorName: errorMessage
  end
```

**Available fragments:**
- `opt [condition]` — optional block (executes only if condition is true)
- `alt [case1] ... else [case2] ... end` — mutually exclusive alternatives
- `loop [condition]` — repetition
- `ref over :System: SSD Name` — reference to another SSD

### 4. Extract the System Operations List

For each identified operation, record:
- Operation name
- Parameters (name + type)
- Expected return
- Originating UC

### 5. Save the Artifacts

```
up_save_artifact(path: "04-dss/DSS-NN-uc-name.md", ...) for each UC
up_save_artifact(path: "04-system-operations.md", title: "System Operations List", ...)
up_update_state(updates: '{"completedActivities":["vision","requirements","use-cases","sequence-diagrams"]}')
```

---

## Reference Template

See `templates/dss-template.md` for a complete example with opt/alt/loop.
