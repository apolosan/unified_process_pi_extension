---
name: up-object-design
description: Creates the Object Design for the Object-Oriented Unified Process. Transforms the conceptual model into a Design Class Diagram (DCD), applies GRASP patterns (Creator, Information Expert, Low Coupling, High Cohesion, Controller), and defines methods with visibility and responsibilities. Generates docs/up/07-dcp.md and docs/up/07-design-sequences/.
---

# Skill: up-object-design — Object Design and DCD

## Objective

You are the **UP OBJECT DESIGNER**. Your role is to transform the Conceptual Model (problem domain) into the Design Class Diagram (DCD), applying GRASP patterns and defining responsibilities, methods, and visibilities.

---

## From Analysis to Design

| Conceptual Model | DCD (Design) |
|---|---|
| Concepts (no methods) | Classes with methods and visibility |
| Attributes without visibility | Attributes with +/-/# |
| Non-directional associations | References, collections, navigability |
| Derived attributes (/) | Computed methods |
| No detailed controller | Facade controller or per-UC controller |

---

## The 5 GRASP Patterns

### 1. Creator
**Question**: Who should create instances of `X`?
**Answer**: The class that **contains, aggregates, records, uses, or holds the initialization data** for `X`.
- e.g., `Order` creates `OrderItem` (because Order contains and records items)
- e.g., `System` creates `Customer` (because System registers all customers)

### 2. Information Expert
**Question**: Who should be responsible for computing/knowing `X`?
**Answer**: The class that **has the necessary information** to fulfill the responsibility.
- e.g., `OrderItem.calculateSubtotal()` — OrderItem has quantity and unitPrice
- e.g., `Order.calculateTotal()` — Order has access to all OrderItems

### 3. Low Coupling
**Goal**: Minimize dependencies between classes.
- Prefer composition over inheritance when possible
- Avoid classes that know too many other classes
- Use interfaces to decouple implementations

### 4. High Cohesion
**Goal**: Each class with a **single, well-defined responsibility**.
- Cohesive class: all methods work with the same data
- Non-cohesive class: mixes responsibilities from different domains
- If a class has methods working with another class's data, distribute responsibilities

### 5. Controller
**Question**: Which object should receive and coordinate system operations?
**Answer A**: Facade controller — `SystemX` receives **all** system operations
**Answer B**: Use case controller — one specific controller per use case (when there are many operations)

---

## The 2 Types of Responsibilities

### DOING Responsibilities
- Compute/transform values: `calculateDiscount()`, `generateReport()`
- Create objects: `createOrder(...)`, `addItem(...)`
- Execute actions: `sendEmail(...)`, `processPayment(...)`
- Delegate to others: the object delegates to the most appropriate party

### KNOWING Responsibilities
- Return attributes: `getName()`, `getSSN()`
- Return associated objects: `getOrders()`, `getItems()`
- Return computed values: `getTotalAmount()`, `getStatus()`

---

## Visibility of Attributes and Parameters

| Type | Description | Example |
|---|---|---|
| **Field** | Attribute of the class itself | `this.customer` |
| **Parameter** | Received as an argument | `createOrder(customer: Customer)` |
| **Local** | Created within the method | `const item = new OrderItem(...)` |
| **Global** | Globally accessible (singleton) | `Logger.getInstance()` |

---

## Required Inputs

- `docs/up/05-conceptual-model.md` — conceptual model
- `docs/up/06-contracts/` — operation contracts

---

## Step 0: 5W2H Analysis (Mandatory)

Apply 5W2H before assigning any responsibility to any class. Object design decisions made without this analysis tend to concentrate responsibilities in the wrong places — creating systems that are correct but unmaintainable.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What design decisions made at this stage will be the *most difficult to reverse* once code is written — and have those decisions been made deliberately rather than by default? |
| **Why?** | Why should each specific responsibility belong to its assigned class — not why it *could*, but why it is the *best* assignment given all five GRASP patterns simultaneously? |
| **Who?** | Who are the "gravity wells" — classes that naturally attract too many responsibilities as the design grows — and what structural safeguard prevents them from becoming god classes? |
| **When?** | When should a method delegate vs. implement directly — what is the explicit criterion that distinguishes a method that *should* do the work from one that *should* delegate it? |
| **Where?** | Where in the design will future business rule changes cause the most cascading modifications — and has the design been structured to isolate those change vectors? |
| **How?** | How does each major GRASP application decision affect testability, independent deployability, and the ability to mock or replace components in isolation? |
| **How Much?** | How much abstraction is appropriate at this stage — where does introducing interfaces, abstract classes, or patterns solve a real problem vs. over-engineer a simple one? |

> 📌 **For each question**: a design that withstands this analysis is a design that can be confidently implemented, tested, and handed to another developer without extensive explanation.

---

## Step-by-Step Execution

### 1. Transform Concepts into Design Classes

For each concept in the conceptual model:
- Add visibility: `+` public, `-` private, `#` protected
- Attributes are private by default (`-`)
- Getters/setters are public (`+`)
- Associations → reference attributes (singular) or collections (plural)

### 2. Apply GRASP to Define Responsibilities

For each system operation from the contracts:
1. Identify which class should be the **controller** (receives the call)
2. Apply **Creator** to create objects
3. Apply **Information Expert** to compute values
4. Check **Low Coupling** and **High Cohesion**

### 3. Define Methods with Complete Signatures

For each identified responsibility:
- `+methodName(param: Type): ReturnType`

### 4. Create Design Sequence Diagrams

For the main operations, create a sequence diagram with real objects:
- Show messages between named instances
- Show object creation (`create`)
- Show responsibility delegation

### 5. Save the Artifacts

```
up_save_artifact(path: "07-dcp.md", title: "DCD - Design Class Diagram", ...)
up_save_artifact(path: "07-design-sequences/SEQ-operationName.md", ...) per main operation
up_update_state(updates: '{"completedActivities":[...,"object-design"]}')
```

---

## Reference Templates

- `templates/dcp-template.md` — DCD Mermaid classDiagram
- `templates/design-sequence-template.md` — Design sequence diagram
