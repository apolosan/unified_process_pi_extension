# Interface Design: [System Name]

> **Version:** 1.0 | **Phase:** Construction

---

## Navigation Diagram

```mermaid
flowchart LR
  Menu["🏠 Main Menu"]

  Menu --> ManageCustomers["👥 Customers"]
  Menu --> ManageProducts["📦 Products"]
  Menu --> PlaceOrder["🛒 New Order"]
  Menu --> Reports["📊 Reports"]

  subgraph Customers
    ManageCustomers --> CustomerList["📋 Customer List\n(Multidata)"]
    CustomerList --> CustomerDetail["👤 Customer Detail\n(Data)"]
    ManageCustomers --> CustomerForm["✏️ New/Edit Customer\n(Entry)"]
    CustomerForm --> |"createCustomer()"| CustomerDetail
    CustomerDetail --> |"editCustomer()"| CustomerForm
    CustomerList --> |"deleteCustomer()"| ConfirmDelete["❓ Confirm Deletion\n(Operation)"]
  end

  subgraph Orders
    PlaceOrder --> SelectCustomer["🔍 Select Customer\n(Selection)"]
    SelectCustomer --> OrderForm["📝 Order Data\n(Entry)"]
    OrderForm --> |"addItem()"| OrderForm
    OrderForm --> |"finalizeOrder()"| OrderDetail["🧾 Order Detail\n(Data)"]
  end

  subgraph Reports
    Reports --> ReportForm["🔎 Parameters\n(Entry)"]
    ReportForm --> |"generateReport()"| ReportResult["📊 Result\n(Multidata)"]
  end
```

---

## Screens by Actor

### Actor: Operator

| Screen | Type | Available Operations |
|---|---|---|
| Main Menu | Index | Navigate to modules |
| Customer List | Multidata | Search, select, delete |
| Customer Detail | Data | View, edit, view orders |
| New/Edit Customer Form | Entry | Save, cancel |
| Place Order | Entry + Selection | Select customer, add items, finalize |
| Product List | Multidata | Search, select |
| Product Detail | Data | View, edit, view stock |

### Actor: Manager

| Screen | Type | Available Operations |
|---|---|---|
| Report Parameters | Entry | Select period and filters |
| Report Result | Multidata | View, export |

---

## Forms

### Form: Customer Registration/Edit

| Field | Widget | Type | Validation | Required |
|---|---|---|---|---|
| Full name | text input | String | Min 3 chars, max 100 | ✓ |
| SSN | text input + mask | SSN | Valid format and check digit | ✓ |
| Email | email input | String | Valid format | ✓ |
| Phone | text input + mask | String | Format (XXX) XXX-XXXX | ✗ |
| Address | text area | String | Max 200 chars | ✗ |

### Form: Add Item to Order

| Field | Widget | Type | Validation | Required |
|---|---|---|---|---|
| Product | autocomplete/search | Product ID | Must exist in catalog | ✓ |
| Quantity | number input | Integer | Min 1, max available stock | ✓ |

---

## Listings

### Customer List

| Column | Source | Sortable | Filter |
|---|---|---|---|
| Name | Customer.name | ✓ | Text search |
| SSN | Customer.ssn | ✗ | Exact match |
| Email | Customer.email | ✗ | Text search |
| Orders | count(Customer.orders) | ✓ | — |

### Order List

| Column | Source | Sortable | Filter |
|---|---|---|---|
| Number | Order.number | ✓ | — |
| Date | Order.date | ✓ | Period |
| Customer | Order.customer.name | ✓ | Text search |
| Total | Order.calculateTotal() | ✓ | — |
| Status | Order.status | ✓ | Select (enum) |

---

## Reports

### Report: Sales by Period

**Input parameters:**
| Parameter | Widget | Type | Required |
|---|---|---|---|
| Start date | date picker | Date | ✓ |
| End date | date picker | Date | ✓ |
| Product (filter) | autocomplete | ID | ✗ |

**Output columns:**
| Column | Grouping | Default Sort |
|---|---|---|
| Product | — | Desc by quantity sold |
| Quantity sold | — | — |
| Total amount | — | — |

**Totals:** Total items sold, Total revenue for the period
