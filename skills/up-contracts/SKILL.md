---
name: up-contracts
description: Creates System Operation Contracts for the Object-Oriented Unified Process. For each system operation from the SSD, specifies pre-conditions, post-conditions in informal OCL (5 types — attribute modification, instance and association creation/destruction), and exceptions. Generates docs/up/06-contracts/.
---

# Skill: up-contracts — System Operation Contracts

## Objective

You are the **UP CONTRACTS ANALYST**. Your role is to create System Operation Contracts — formal specifications that describe what the system must do (post-conditions) when an operation is called, without specifying how to implement it.

---

## Core Concepts

### What Is a Contract?
A contract specifies the **observable behavior** of a system operation:
- **Pre-conditions**: what is true **before** the operation (may be assumed)
- **Post-conditions**: what is true **after** the operation (what the system must guarantee)

### The 5 Types of Post-Conditions (Informal OCL)

| Type | Syntax | Example |
|---|---|---|
| **Attribute modification** | `obj.attribute := newValue` | `order.status := OrderStatus.PROCESSING` |
| **Instance creation** | `new Concept(params) was created` | `new OrderItem(quantity=2, price=15.00) was created` |
| **Association creation** | `obj1.role.add(obj2)` | `order.items.add(newItem)` |
| **Instance destruction** | `instance.delete()` | `orderItem.delete()` |
| **Association destruction** | `obj1.role.remove(obj2)` | `order.items.remove(item)` |

> 📌 **Important**: Post-conditions describe **state changes in the conceptual model**, not implementation code.

---

## Required Inputs

- `docs/up/04-system-operations.md` — list of system operations
- `docs/up/05-conceptual-model.md` — conceptual model (for concept and role names)
- Template at `templates/contract-template.md`

---

## Step 0: 5W2H Analysis (Mandatory)

Apply 5W2H before writing the first contract. Contracts are formal specifications — an unasked question here becomes an incorrect or incomplete post-condition that will silently corrupt the object design.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What side effects of each operation are *not immediately obvious* — state changes in distant objects, constraint violations that propagate across associations, or invariants that could be temporarily broken during execution? |
| **Why?** | Why does each pre-condition exist exactly as stated — what specific failure, inconsistency, or corrupted state would occur if that pre-condition were violated? |
| **Who?** | Who is responsible for ensuring each pre-condition is satisfied *before* an operation is called — the caller, a previous operation, the UI layer, or an invariant enforced by the model? |
| **When?** | When should an operation throw an exception vs. silently correct an edge case vs. delegate the problem back to the caller with a meaningful return value? |
| **Where?** | Where do the post-conditions of related operations need to be explicitly coordinated to guarantee transactional consistency across multiple objects in the same use case flow? |
| **How?** | How should cascading post-conditions be handled — when one operation's effect triggers required state changes in many other objects, is the cascade explicit in the contract or implied? |
| **How Much?** | How much OCL formalism is genuinely useful at this point — where does informal natural language communicate better than a formal expression, and where does imprecision introduce risk? |

> 📌 **For each question**: contracts that survive this analysis are technically defensible — they can be directly transformed into object design without ambiguity.

---

## Step-by-Step Execution

### 1. Load Operations and Conceptual Model

```
up_load_artifact(path: "04-system-operations.md")
up_load_artifact(path: "05-conceptual-model.md")
```

### 2. Create a Contract for Each System Operation

**Contract structure:**

1. **Name and signature**: `operationName(param1: Type, param2: Type): ReturnType`
2. **Responsibility**: natural language description of what the operation does
3. **Pre-conditions**: conditions assumed to be true (existence of objects, valid states)
4. **Post-conditions**: effects on the conceptual model using the 5 OCL types
5. **Exceptions**: when pre-conditions are not satisfied

### 3. Standard Contracts for CRUDs

For simple CRUD operations, use standardized contracts:

**Create [Entity]**:
- Pre: no entity exists with the same identifier
- Post: new Entity(params) was created; System.entities.add(newEntity)

**Read [Entity]**:
- Pre: an entity with the provided identifier exists
- Post: (no state change — read-only operation)

**Update [Entity]**:
- Pre: an entity with the provided identifier exists
- Post: entity.attribute := newValue (for each modified attribute)

**Delete [Entity]**:
- Pre: an entity with the identifier exists; no dependencies prevent deletion
- Post: entity.delete(); System.entities.remove(entity)

### 4. Save the Artifacts

```
up_save_artifact(path: "06-contracts/CONTRACT-operationName.md", ...) for each operation
up_save_artifact(path: "06-contracts-summary.md", title: "Contracts Summary", ...)
up_update_state(updates: '{"completedActivities":[...,"contracts"]}')
```

---

## Reference Template

See `templates/contract-template.md` for the complete structure.
