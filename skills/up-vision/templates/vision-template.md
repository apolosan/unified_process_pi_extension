# System Vision Document: [System Name]

> **Version:** 1.0 | **Date:** [date] | **Author:** [author]

---

## 1. Problem Statement

| | |
|---|---|
| **The problem of** | [Description of the business problem] |
| **Affects** | [Affected stakeholders] |
| **Whose impact is** | [Current impact of the problem] |
| **A good solution would be** | [Proposed solution at a high level] |

**Current situation:**
[Describe how the process/situation works today, without the system]

**Desired situation:**
[Describe how the process should work with the system]

---

## 2. Business Context

**Domain:** [e.g., Library Management, E-Commerce, Hospital System]

**Organization:** [Name of the organization or context of use]

**Motivation:** [Why is this system needed now?]

---

## 3. Stakeholders

| Stakeholder | Role | Interest in the System |
|---|---|---|
| [e.g., Librarian] | [e.g., Primary operator] | [e.g., Manage collection and loans] |
| [e.g., Reader/User] | [e.g., End user] | [e.g., Search and reserve books] |
| [e.g., Manager] | [e.g., Decision maker] | [e.g., Management reports] |
| [e.g., Payment System] | [e.g., External system] | [e.g., Process fine payments] |

---

## 4. System Scope

**The system MUST:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Key features by actor:**

| Actor | Features |
|---|---|
| [Actor 1] | [List of features] |
| [Actor 2] | [List of features] |

---

## 5. Out of Scope

The system will **NOT** be responsible for:
- [e.g., Full financial management — only payment records]
- [e.g., Human resources — only user authentication]
- [e.g., ERP integration — data exported manually]

---

## 6. Constraints

### 6.1 Technical Constraints
- [e.g., Must work as a standalone system (no internet dependency)]
- [e.g., Must integrate with legacy system X via REST API]

### 6.2 Business Constraints
- [e.g., Must go live within 6 months]
- [e.g., Must comply with GDPR/LGPD for user data]

### 6.3 Quality Constraints
- [e.g., Minimum availability of 99% during business hours]
- [e.g., Maximum response time of 2 seconds for queries]

---

## 7. Initial Glossary

| Term | Definition |
|---|---|
| [e.g., Loan] | [e.g., Act of making a collection copy available to a reader for a defined period] |
| [e.g., Copy] | [e.g., Physical copy of a title present in the collection] |
| [e.g., Title] | [e.g., Work identified by ISBN, which may have one or more copies] |
| [e.g., Reservation] | [e.g., Request to be notified when a copy becomes available] |
