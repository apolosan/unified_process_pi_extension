# Use Case: `<<rep>>` Generate report on [X]

> **ID:** UC-NN | **Stereotype:** `<<rep>>` | **Phase:** Elaboration

**Actors:** [e.g., Manager, Operator]

**Pre-conditions:**
- [e.g., [X] records exist in the system]

---

## Main Flow

1. `[IN]` The user provides filter parameters:
   - [Parameter 1]: [e.g., Period — start date and end date]
   - [Parameter 2]: [e.g., Category]
   - [Parameter 3 (optional)]: [e.g., Sort order]
2. `[OUT]` The system displays [X data] grouped by [grouping criterion], sorted by [sort criterion], containing the columns: [col1], [col2], [col3, ...].

---

## Exception 1a — No results found

1a.1. `[OUT]` The system informs that no records match the provided parameters.
1a.2. Returns to step 1 to provide new parameters.

---

## Success Post-conditions

- The [X] report has been generated and displayed with data matching the provided parameters.

---

## Notes

- Mandatory parameters: [list]
- Optional parameters: [list — if empty, includes all]
- Output can be exported to: [PDF, Excel, screen — as defined in interface design]
