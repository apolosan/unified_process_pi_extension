# Conceptual Model: [System Name]

> **Version:** 1.0 | **Phase:** Elaboration

---

## Conceptual Class Diagram

```mermaid
classDiagram
  class System {
    <<controller>>
  }

  class Customer {
    <<oid>> ssn : SSN
    name : String
    email : String
    phone : String
    address : Address
  }

  class Order {
    <<oid>> number : Integer
    date : Date
    /totalAmount : Money
    status : OrderStatus
  }

  class OrderItem {
    quantity : Integer
    unitPrice : Money
    /subtotal : Money
  }

  class Product {
    <<oid>> code : String
    description : String
    salePrice : Money
    stockAvailable : Integer
  }

  class ProductType {
    <<oid>> name : String
    description : String
  }

  class OrderStatus {
    <<enumeration>>
    OPEN
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  System "1" --> "0..*" Customer : customers
  System "1" --> "0..*" Product : products
  Customer "1" --> "0..*" Order : orders
  Order "1" *-- "1..*" OrderItem : items
  OrderItem "0..*" --> "1" Product : product
  Product "0..*" --> "1" ProductType : type
```

---

## Concept Descriptions

### Customer
A person or organization that places orders in the system.
- `ssn`: unique customer identifier (`<<oid>>`)
- `totalAmount`: sum of item subtotals (derived `/`)

### Order
Record of a purchase made by a customer.
- `number`: unique sequential identifier (`<<oid>>`)
- `status`: current order state (`OrderStatus` enumeration)
- `totalAmount`: sum of item subtotals (derived `/`)

### OrderItem
**Association class** between Order and Product — represents each line of the order.
- `subtotal`: `quantity * unitPrice` (derived `/`)

### Product
Item available for sale in the catalog.
- `code`: unique product identifier (`<<oid>>`)

### ProductType
**Specification Class pattern** — groups products of the same type (e.g., Book, Electronics).
Avoids repeating common attributes across multiple Products.

---

## Associations

| From | To | Multiplicity | Role | Note |
|---|---|---|---|---|
| System | Customer | 1 → 0..* | customers | Controller connects to the model |
| Customer | Order | 1 → 0..* | orders | A customer has zero or more orders |
| Order | OrderItem | 1 → 1..* | items | Composition — items belong to the order |
| OrderItem | Product | 0..* → 1 | product | Many items reference the same product |
| Product | ProductType | 0..* → 1 | type | Specification — multiple products of the same type |

---

## Applied Patterns

| Pattern | Where Applied | Justification |
|---|---|---|
| Specification Class | ProductType ← Product | Avoids repeating description and category in each product |
| Association Class | OrderItem | Association between Order and Product with its own attributes |
