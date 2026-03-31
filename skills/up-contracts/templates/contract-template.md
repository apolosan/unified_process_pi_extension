# Contract: `operationName(param1: Type, param2: Type): ReturnType`

> **Origin:** UC-NN, step N | **Phase:** Elaboration

---

## Responsibility

[Natural language description of what this operation does from the domain perspective. e.g., "Starts a new purchase for the identified customer, creating an open order linked to the customer."]

---

## Pre-conditions

> Facts assumed to be true **before** execution (not verified at runtime — the caller's responsibility or guaranteed by prior operations).

- `[existence]` An instance of `Customer` with `ssn = ssnParam` exists
- `[state]` The identified `Customer` has no outstanding fines
- `[existence]` An instance of `Product` with `code = codeParam` exists

---

## Post-conditions

> What is true **after** successful execution. Use the 5 OCL post-condition types.

### Instance creation
- `new Order(number=nextNumber, date=today, status=OPEN)` was created

### Association creation
- `customer.orders.add(newOrder)` — order associated with the customer
- `system.orders.add(newOrder)` — order registered in the system

### Attribute modification
- `product.stockAvailable := product.stockAvailable - quantity`
- `order.status := OrderStatus.PROCESSING`

### Instance creation + association (combined example)
- `new OrderItem(quantity=qtyParam, unitPrice=product.salePrice)` was created
- `order.items.add(newItem)`
- `newItem.product := product`

### Association destruction
- `reservation.items.remove(item)` — item removed from the previous reservation

### Instance destruction
- `oldItem.delete()` — instance removed from the system

---

## Exceptions

| Condition | Violated Pre-condition | Action |
|---|---|---|
| Customer not found | `ssn` does not exist in the system | Throw `CustomerNotFound` |
| Customer with fines | Customer with `status = BLOCKED` | Throw `CustomerBlocked` |
| Insufficient stock | `product.stockAvailable < quantity` | Throw `InsufficientStock` |

---

## Notes

- This operation is part of the transaction started by `startPurchase()`
- The `totalAmount` post-condition on Order is automatically derived (attribute `/`)
