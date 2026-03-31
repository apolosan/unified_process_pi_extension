# Use Case: `<<CRUD>>` Manage [Entity]

> **ID:** UC-NN | **Stereotype:** `<<CRUD>>` | **Phase:** Elaboration

**Actors:** [e.g., Operator, Administrator]

**Pre-conditions:**
- [e.g., The user is authenticated in the system]
- [e.g., The session is active]

---

## Main Flow

1. The user chooses the operation to perform:
   - 1.1 Variant `insert`
   - 1.2 Variant `read`
   - 1.3 Variant `update`
   - 1.4 Variant `delete`

---

## Variant 1.1: Insert

1.1.1. `[IN]` The user provides: [field1], [field2], [field3, ...]
1.1.2. `[OUT]` The system validates the data and records the new [Entity] instance.
1.1.3. `[OUT]` The system confirms the successful insertion.

---

## Variant 1.2: Read

1.2.1. `[OUT]` The system displays a list of [Entity] with [attribute1] and [attribute2], sorted by [criterion].
1.2.2. `[IN]` The user selects an item from the list.
1.2.3. `[OUT]` The system displays all data for the selected [Entity].

---

## Variant 1.3: Update

1.3.1. Includes Variant 1.2 (steps 1.2.1 to 1.2.3).
1.3.2. `[IN]` The user provides new values for: [field1], [field2], [field3, ...]
1.3.3. `[OUT]` The system validates and updates the data for the selected instance.
1.3.4. `[OUT]` The system confirms the successful update.

---

## Variant 1.4: Delete

1.4.1. `[OUT]` The system displays a list of [Entity] with [attribute1] and [attribute2].
1.4.2. `[IN]` The user selects the item to delete.
1.4.3. `[OUT]` The system requests deletion confirmation.
1.4.4. `[IN]` The user confirms the deletion.
1.4.5. `[OUT]` The system removes the instance and confirms the deletion.

---

## Exception 1.1.1a — [Business rule or uniqueness violation]

1.1.1a.1. `[OUT]` The system informs that [description of the problem].
1.1.1a.2. Returns to step 1.1.1 to provide correct data.

## Exception 1.3.2a — Update violates business rule

1.3.2a.1. `[OUT]` The system informs the rule that prevents the update.
1.3.2a.2. Returns to step 1.3.2 to provide new data.

## Exception 1.4.2a — Deletion violates structural constraint

1.4.2a.1. `[OUT]` The system informs that [Entity] cannot be deleted because [reason — e.g., it has associated records].
1.4.2a.2. The use case ends without deletion.

---

## Success Post-conditions

- **Insert**: new [Entity] instance recorded with the provided data
- **Read**: [Entity] data displayed to the user (no state change)
- **Update**: [Entity] instance updated with new values
- **Delete**: [Entity] instance removed from the system
