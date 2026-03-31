# DCD — Design Class Diagram: [System Name]

> **Version:** 1.0 | **Phase:** Construction

---

## Design Class Diagram (DCD)

```mermaid
classDiagram
  class SalesSystem {
    <<controller>>
    -customers : Map~SSN, Customer~
    -products : Map~String, Product~
    -orders : List~Order~
    +createCustomer(name: String, ssn: SSN) Customer
    +findCustomer(ssn: SSN) Customer
    +startOrder(ssn: SSN) Order
    +addItem(orderNum: Integer, productCode: String, qty: Integer) void
    +finalizeOrder(orderNum: Integer) void
  }

  class Customer {
    -ssn : SSN
    -name : String
    -email : String
    -orders : List~Order~
    +getSSN() SSN
    +getName() String
    +getOrders() List~Order~
    +addOrder(order: Order) void
  }

  class Order {
    -number : Integer
    -date : Date
    -status : OrderStatus
    -items : List~OrderItem~
    -customer : Customer
    +getNumber() Integer
    +getStatus() OrderStatus
    +getItems() List~OrderItem~
    +calculateTotal() Money
    +addItem(product: Product, qty: Integer) OrderItem
    +finalize() void
    +cancel() void
  }

  class OrderItem {
    -quantity : Integer
    -unitPrice : Money
    -product : Product
    +getQuantity() Integer
    +calculateSubtotal() Money
    +getProduct() Product
  }

  class Product {
    -code : String
    -description : String
    -salePrice : Money
    -stockAvailable : Integer
    +getCode() String
    +getSalePrice() Money
    +getStock() Integer
    +decrementStock(qty: Integer) void
    +isAvailable(qty: Integer) Boolean
  }

  class OrderStatus {
    <<enumeration>>
    OPEN
    PROCESSING
    FINALIZED
    CANCELLED
  }

  SalesSystem ..> Customer : <<create>>
  SalesSystem ..> Order : <<create>>
  SalesSystem "1" o-- "0..*" Customer
  SalesSystem "1" o-- "0..*" Product
  Customer "1" o-- "0..*" Order
  Order "1" *-- "1..*" OrderItem
  OrderItem "0..*" --> "1" Product
  Order --> OrderStatus
```

---

## Responsibilities per Class

### SalesSystem (Facade Controller)
- **GRASP**: Controller (facade), Creator (creates Customer and Order)
- **DOING responsibilities**: coordinate system operations, create main objects
- **KNOWING responsibilities**: look up customers and products by identifier

### Customer
- **GRASP**: Information Expert (knows its orders)
- **KNOWING responsibilities**: own data, own orders

### Order
- **GRASP**: Creator (creates OrderItem), Information Expert (calculates total)
- **DOING responsibilities**: add item, finalize, cancel
- **KNOWING responsibilities**: its items, calculate total (delegates to items)

### OrderItem
- **GRASP**: Information Expert (calculates subtotal)
- **KNOWING responsibilities**: subtotal = quantity × unitPrice
