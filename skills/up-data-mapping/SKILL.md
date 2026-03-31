---
name: up-data-mapping
description: Creates the Data Model for the Object-Oriented Unified Process. Maps the DCD to relational tables using inheritance strategies (single-table hierarchy, table-per-subclass), handles associations (1-1, 1-N, N-N with join tables), association classes, and indicates where to apply lazy loading. Generates docs/up/09-data-model.md.
---

# Skill: up-data-mapping — Object-Relational Mapping

## Objective

You are the **UP DATA DESIGNER**. Your role is to create the Data Model — the mapping of the Design Class Diagram (DCD) to a relational model, describing tables, columns, keys, and relationships in a **database-agnostic** way.

---

## Mapping Rules

### 1. Class → Table

For each concrete class in the DCD:
- Create a table with the class name (in snake_case)
- Each private attribute → column in the table
- Identifiers (`<<oid>>`) → Primary Key (PK)
- Types: String → VARCHAR, Integer → INTEGER, Money → DECIMAL(10,2), Date → DATE, etc.

### 2. Associations → Foreign Keys

| Multiplicity | Strategy | Where to Place the FK |
|---|---|---|
| 1 to 1 | FK on either side (prefer the "child" side) | The side that "belongs to" the other |
| 1 to N | FK on the N side (many) | Table of the "many" side |
| N to N | Join table with two FKs | New intermediate table |

### 3. Inheritance → Mapping Strategies

**Option A — Single Table per Hierarchy** (Table Per Hierarchy):
- One table for the entire hierarchy
- Subclass-exclusive attributes are `NULLABLE` columns
- A discriminator column indicates the type (`concrete_type VARCHAR`)
- ✓ Simple, no joins | ✗ Many null columns

**Option B — Table per Subclass** (Table Per Subclass / Joined):
- One table per concrete class (including the superclass)
- Subclass tables have an FK pointing to the superclass table
- ✓ No null columns, more normalized | ✗ Joins required for queries

**Selection criteria**: Use Single Table when subclasses have few exclusive attributes. Use Table per Subclass when subclasses have many distinct attributes.

### 4. Association Class → Join Table

When an N-N association has its own attributes (Association Class in the DCD):
- Create an intermediate table with FKs to both classes
- Include the association class attributes as columns
- PK is composed of the two FKs (or a surrogate key if needed)

### 5. Lazy Loading

Indicate where to apply lazy loading (deferred loading) to avoid loading large data volumes:
- Collections with high volume (`0..*` with many records)
- Associations that are rarely accessed together

---

## Required Inputs

- `docs/up/07-dcp.md` — DCD with classes, attributes, and associations

---

## Step 0: 5W2H Analysis (Mandatory)

Apply 5W2H before creating the first table. Data model decisions are among the most permanent in a system — schema migrations are expensive, and a structure optimized for the wrong query pattern degrades under production load.

| Dimension | Original Question for This Activity |
|---|---|
| **What?** | What query patterns will be most frequent and performance-critical in production — and does the proposed table structure genuinely optimize for those patterns, or for the object model's convenience? |
| **Why?** | Why choose one inheritance strategy over another for each hierarchy — not just in theory, but given the specific volume, access patterns, and mutation frequency of *this* system's data? |
| **Who?** | Who will own the database schema and be responsible for managing migrations as the domain model evolves — and do they have the authority and tooling to execute schema changes safely in production? |
| **When?** | When should lazy loading be applied vs. eager loading — what specific access patterns, object graph depths, and transaction boundaries justify each choice for each major association? |
| **Where?** | Where will the schema need to support analytical or reporting queries that differ structurally from transactional queries — and does a single schema serve both, or does this require a separate read model? |
| **How?** | How will the chosen ORM mapping strategy handle the semantic gap between the object model's encapsulation and the relational model's structural constraints — especially for associations, inheritance, and derived attributes? |
| **How Much?** | How much denormalization is acceptable to achieve the system's performance targets — and at what point does denormalization introduce data consistency risks that require compensating controls? |

> 📌 **For each question**: a data model that survives this analysis is a data model that will serve the system in production — not just pass a schema review.

---

## Step-by-Step Execution

### 1. Load the DCD

```
up_load_artifact(path: "07-dcp.md")
```

### 2. Map Each Class to a Table

For each concrete class in the DCD:
- Table name (snake_case)
- Columns with SQL types
- PK (from `<<oid>>` identifiers)
- Indexes for frequently queried fields

### 3. Map Associations to FKs

For each association in the DCD:
- Determine the multiplicity
- Add the FK to the correct table
- For N-N: create a join table

### 4. Handle Inheritance

For each inheritance hierarchy:
- Choose a strategy (Single Table or Table per Subclass)
- Document the justification

### 5. Indicate Lazy Loading

For collections with potentially high volume:
- Mark with `LAZY` in the mapping

### 6. Generate Conceptual DDL

Create `CREATE TABLE` statements that are database-agnostic:
- `NOT NULL` for mandatory attributes
- `UNIQUE` for secondary identifiers
- `FOREIGN KEY REFERENCES`

### 7. Save the Artifact

```
up_save_artifact(
  path: "09-data-model.md",
  title: "Data Model - ORM Mapping",
  content: [complete content],
  phase: "construction",
  activity: "data-mapping"
)
up_update_state(updates: '{"completedActivities":[...,"data-mapping"],"currentPhase":"transition"}')
```

---

## Note on Persistence

The mapping described here is conceptual and technology-independent. The implementation may use:
- ORM frameworks (JPA/Hibernate, EF Core, SQLAlchemy, Prisma, TypeORM, etc.)
- Direct access (JDBC, PDO, psycopg2, pg, etc.)
- Any relational database vendor
