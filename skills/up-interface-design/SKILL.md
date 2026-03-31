---
name: up-interface-design
description: Creates the Interface Design for the Object-Oriented Unified Process. Defines screens, forms with fields and validations, lists with columns and filters, and reports with parameters. Describes navigation using a Mermaid flowchart. Technology-agnostic. Generates docs/up/08-interface-design.md.
---

# Skill: up-interface-design — Interface Design

## Objective

You are the **UP INTERFACE DESIGNER**. Your role is to design the system's user interfaces in a **technology-agnostic** way — describing the navigation flow, screens, forms, and listings without specifying frameworks or implementation languages.

---

## The 6 Types of Interface Units

Based on the WebML model (Web Modeling Language), every interface is composed of:

| Type | Description | Example |
|---|---|---|
| **Index/Menu** | Entry point — list of options | Main menu, navigation bar |
| **Data Unit** | Displays a single object with its attributes | Customer profile, order detail |
| **Multidata Unit** | List/grid of multiple objects | Customer table, product list |
| **Entry Unit** | Form for data insertion/editing | Registration form, profile edit |
| **Selection Unit** | Interactive list for selection | Dropdown, clickable list, autocomplete |
| **Operation Unit** | Executes a system operation | "Save" button, deletion confirmation |

---

## Standard Navigation Flows

### Full CRUD Flow
```
Index → Multidata (list) → Data (detail)
Index → Entry (insert) → Operation (create) → Data (confirmation)
Data → Entry (update) → Operation (update) → Data (updated)
Multidata → Operation (delete) → confirmation → Multidata (updated)
```

### Report Flow
```
Index → Entry (parameters) → Operation (generate) → Multidata (result)
```

### Functional Process Flow
```
Index → Selection (select object) → Entry (process data) → Operation (execute) → Data (result)
```

---

## Required Inputs

- `docs/up/03-use-cases/` — to understand each UC flow
- `docs/up/04-dss/` — to identify the system operations called
- `docs/up/07-dcp.md` — to know the available attributes in each class

---

## Step 0: 5W2H Analysis (Mandatory)

Apply 5W2H before designing a single screen. Interface design that skips this step produces technically complete wireframes that users don't understand, workflows that look logical but feel wrong, and forms that collect the right data in the wrong order.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What workflows do users *actually* perform in practice vs. what they *say* they perform — and where do the stated use cases diverge from observed real-world behavior in ways that would make the interface feel wrong? |
| **Why?** | Why does the system need to present each piece of data in the specified format — what specific decision, action, or judgment does seeing that data enable the user to make? |
| **Who?** | Who are the edge-case users — domain experts who need power features, occasional users who need extensive guidance, users under time pressure, users with accessibility needs — whose requirements may directly conflict with the typical user's preferred design? |
| **When?** | When should the interface *proactively* guide or warn users vs. respond passively to their input — at what points in the workflow is proactive feedback the difference between correct and incorrect usage? |
| **Where?** | Where in the user journey do the most critical and costly errors occur — the errors that are hard to detect, hard to reverse, or that propagate downstream — and how does the design prevent them structurally? |
| **How?** | How will accessibility requirements (keyboard-only navigation, screen reader compatibility, color contrast ratios, touch targets) concretely affect each major screen's layout and interaction model? |
| **How Much?** | How much interface complexity is acceptable before a feature should be redesigned for simplicity, split across multiple screens, or deferred to a later iteration? |

> 📌 **For each question**: interfaces that survive this analysis are interfaces designed for real humans — not for the analyst who understood the system perfectly after six weeks of immersion.

---

## Step-by-Step Execution

### 1. Organize by Actor

For each system actor, list the accessible screens and the entry point.

### 2. Map Interface Units for Each UC

Identify which units compose the UC flow:
- What data is displayed? → Data Unit or Multidata Unit
- What data is collected? → Entry Unit with fields and validations
- What selection is needed? → Selection Unit
- What operation is executed? → Operation Unit

### 3. Create the Navigation Diagram

Use Mermaid flowchart to represent the flow between screens:

```mermaid
flowchart LR
  Menu["🏠 Main Menu"] --> CustomerList["📋 Customer List\n(Multidata)"]
  CustomerList --> CustomerDetail["👤 Customer Detail\n(Data)"]
  Menu --> NewCustomerForm["✏️ New Customer\n(Entry)"]
  NewCustomerForm --> |"[IN] Save"| CreateCustomerOp["⚙️ createCustomer()\n(Operation)"]
  CreateCustomerOp --> |"Success"| CustomerDetail
  CreateCustomerOp --> |"Error"| NewCustomerForm
```

### 4. Define Fields for Each Form

| Field | Widget | Type | Validation | Required |
|---|---|---|---|---|
| Full name | text input | String | Min 3 chars | ✓ |
| SSN | text input + mask | SSN | Valid (check digit) | ✓ |
| Email | email input | String | Valid format | ✓ |
| Birth date | date picker | Date | Not in the future | ✗ |

### 5. Define Columns and Filters for Each Listing

| Column | Source | Sortable | Filterable |
|---|---|---|---|
| Name | Customer.name | ✓ | Text search |
| SSN | Customer.ssn | ✗ | Exact match |
| Status | Order.status | ✓ | Select (enum) |

### 6. Define Parameters and Output for Reports

**Input parameters:**
| Parameter | Widget | Required |
|---|---|---|
| Start date | date picker | ✓ |
| Category | select | ✗ |

**Output columns:**
| Column | Grouping | Sort Order |
|---|---|---|
| Product | By category | Desc by quantity |
| Quantity | — | — |

### 7. Save the Artifact

```
up_save_artifact(path: "08-interface-design.md", title: "Interface Design", ...)
up_update_state(updates: '{"completedActivities":[...,"interface-design"],"currentPhase":"construction"}')
```

---

## Reference Template

See `templates/interface-template.md` for the complete structure.
