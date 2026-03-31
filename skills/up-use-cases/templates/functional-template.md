# Use Case: [Process Name]

> **ID:** UC-NN | **Stereotype:** `[functional]` | **Phase:** Elaboration

**Actors:** [e.g., Customer, Operator, Payment System]

**Pre-conditions:**
- [e.g., The customer is authenticated]
- [e.g., The product is available in stock]

---

## Main Flow

1. `[IN]` The [actor] initiates the [name] process.
2. `[OUT]` The system displays [relevant information/options].
3. `[IN]` The [actor] provides/selects [required data].
4. `[OUT]` The system validates and processes the data.
5. `[IN]` The [actor] confirms the operation.
6. `[OUT]` The system records the operation and confirms success.

---

## Variant 2a: [Alternative condition]

2a.1. `[OUT]` The system displays [alternative].
2a.2. `[IN]` The [actor] [alternative action].
2a.3. Returns to step 3.

---

## Exception 3a — [Invalid data / violated rule]

3a.1. `[OUT]` The system informs [reason for the problem].
3a.2. Returns to step 3 to provide correct data.

## Exception 4a — [Processing failed]

4a.1. `[OUT]` The system informs the [actor] of the failure.
4a.2. The use case ends without recording the operation.

---

## Success Post-conditions

- [Observable result 1 — e.g., order recorded in the system]
- [Observable result 2 — e.g., stock decremented]
- [Observable result 3 — e.g., notification sent to the customer]

---

## Related Requirements

- [e.g., BR-01 — related business rule]
- [e.g., FR-05 — related functional requirement]
