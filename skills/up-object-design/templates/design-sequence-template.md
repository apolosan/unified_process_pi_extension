# Design Sequence: `operationName(params)`

> **Operation:** operationName | **Controller:** SystemX | **Phase:** Construction

---

## Design Sequence Diagram

```mermaid
sequenceDiagram
  participant :SalesSystem
  participant c:Customer
  participant o:Order
  participant oi:OrderItem
  participant p:Product

  %% Controller receives the call
  note over :SalesSystem: startOrder(customerSSN)

  %% Retrieve existing object
  :SalesSystem->>c:Customer: [via customers.get(ssn)]

  %% Create a new object (Creator)
  :SalesSystem->>o:Order: create(number, date)

  %% Delegate to the most appropriate object (Information Expert)
  :SalesSystem->>c:Customer: addOrder(o:Order)
  c:Customer->>c:Customer: this.orders.add(order)

  note over :SalesSystem: addItem(orderNum, productCode, qty)

  %% Retrieve object by identifier
  :SalesSystem->>p:Product: [via products.get(code)]

  %% Check availability (Information Expert)
  :SalesSystem->>p:Product: isAvailable(qty)
  p:Product-->>:SalesSystem: true

  %% Delegate creation to the containing object (Creator)
  :SalesSystem->>o:Order: addItem(p, qty)
  o:Order->>oi:OrderItem: create(qty, p.salePrice)
  o:Order->>oi:OrderItem: this.items.add(oi)

  %% Side effect
  :SalesSystem->>p:Product: decrementStock(qty)
```

---

## Design Decisions

| Decision | GRASP Pattern | Justification |
|---|---|---|
| `SalesSystem` receives system calls | Controller | Facade controller centralizes coordination |
| `Order.addItem()` creates OrderItem | Creator | Order contains and aggregates items |
| `OrderItem.calculateSubtotal()` | Information Expert | OrderItem has qty and unitPrice |
| `Order.calculateTotal()` delegates to each item | Information Expert + delegation | Total = sum of item subtotals |

---

## Visibilities Used

- **Field**: `c:Customer` accessed via `this.customers.get(ssn)` (SalesSystem attribute)
- **Parameter**: `p:Product` passed from SalesSystem to `Order.addItem()`
- **Local**: `oi:OrderItem` created locally inside `Order.addItem()`
