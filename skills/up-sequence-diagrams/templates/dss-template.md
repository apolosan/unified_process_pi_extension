# SSD — [Use Case Name]

> **UC Ref:** UC-NN | **Phase:** Elaboration

---

## System Sequence Diagram

```mermaid
sequenceDiagram
  actor Customer
  participant :System

  %% Main step: [IN] actor initiates operation
  Customer->>:System: startProcess(param1, param2)
  :System-->>Customer: confirmationOfStart

  %% Intermediate steps
  Customer->>:System: addItem(itemId, quantity)
  :System-->>Customer: subtotal

  %% Optional step (exception opt)
  opt [customer not registered]
    Customer->>:System: registerCustomer(name, ssn, email)
    :System-->>Customer: customerCreated
  end

  %% Alternative (alt)
  alt [payment by credit card]
    Customer->>:System: finalizeWithCard(cardNumber, cvv)
    :System-->>Customer: paymentConfirmation
  else [payment by bank slip]
    Customer->>:System: finalizeWithSlip()
    :System-->>Customer: slipCode
  end

  %% Loop
  loop [for each item in the list]
    Customer->>:System: confirmItem(itemId)
    :System-->>Customer: itemConfirmed
  end

  %% Reference to another SSD
  rect rgb(230, 230, 255)
    note over Customer,:System: ref: SSD Authorize Payment
  end
```

---

## Identified System Operations

| # | Operation | Parameters | Return | Origin |
|---|---|---|---|---|
| 1 | `startProcess(param1, param2)` | param1: Type, param2: Type | confirmation | UC-NN step 1 |
| 2 | `addItem(itemId, quantity)` | itemId: ID, quantity: Integer | subtotal: Money | UC-NN step 3 |
| 3 | `finalizeWithCard(cardNumber, cvv)` | cardNumber: String, cvv: String | confirmation | UC-NN step 5 |

---

## Notes

- Strategy: **Stateful** (system maintains session) / **Stateless** (each op is self-contained)
- DTO used: [if applicable — data transfer object]
