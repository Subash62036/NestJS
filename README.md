

# ##############################
# Order Microservice  (NestJS + Prisma)
# ##############################

## Overview

This microservice handles order creation, validation, stock reservation,
and order status updates. Built using NestJS, Prisma, and PostgreSQL.

This microservice handles:

Creating orders

Updating order status

Validating request body using custom Pipe

API-key protected routes using Guard

Transforming responses via Interceptor

Logging requests using Middleware

Stock reservation through Product Service

Transactional order & order items creation

## Features

-   Create orders
-   Update order status
-   API key guard
-   Request logging middleware
-   Response transform interceptor
-   Custom validation pipe
-   Prisma ORM integration
-   Calls Product Service to adjust stock

## Prisma Schema (Order + OrderItem)

model Order {
  id          Int         @id @default(autoincrement())
  orderNumber String      @unique
  customerName String?
  customerEmail String?
  totalCents  Int
  currency    String      @default("INR")
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  items       OrderItem[]
}

model OrderItem {
  id         Int    @id @default(autoincrement())
  order      Order  @relation(fields: [orderId], references: [id])
  orderId    Int
  productId  Int
  productName String
  unitPrice  Int
  qty        Int
  totalPrice Int
}


## Folder Structure

    order-service/
    │── prisma/
    │    ├── schema.prisma
    │    └── prisma.service.ts
    │
    │── src/
    │    ├── comman/
    │    │     ├── guard/api-key.guard.ts
    │    │     ├── interceptors/order-transform.interceptor.ts
    │    │     └── middleware/logger.middleware.ts
    │    ├── order/
    │    │     ├── dto/
    │    │     ├── pipes/order-validation.pipe.ts
    │    │     ├── order.controller.ts
    │    │     ├── order.module.ts
    │    │     └── order.service.ts
    │    ├── main.ts
    │    └── app.module.ts
    │
    └── .env

## Installation

    npm install
    npx prisma generate
    npx prisma migrate dev

## Environment Variables

    DATABASE_URL=postgresql://user:pass@localhost:5432/orderdb
    PRODUCT_SERVICE_URL=http://localhost:3001
    API_KEY=secret123
    PORT=3002

## Run

    npm run start:dev

## API Routes

-   POST /orders
-   GET /orders
-   GET /orders/:id
-   PATCH /orders/:id/status
-   POST  /products/:id/adjust-stock
-   GET   /products/:id


# ##############################
# Product Service (NestJS + Prisma)
# ##############################



## 📌 Overview
The **Product Service** is a microservice responsible for managing products, handling stock updates, and providing product information to other services such as Order Service.

This service is built using:
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **Axios (HTTP communication)**
- **Middleware for logging**

---

## 📁 Project Structure

```
product-service/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── .env
│
├── src/
│   ├── common/middleware/
│   │   └── logger.middleware.ts
│   │
│   ├── prisma/
│   │   └── prisma.service.ts
│   │
│   ├── product/
│   │   ├── dto/
│   │   ├── product.controller.ts
│   │   ├── product.module.ts
│   │   └── product.service.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── logs/
│   └── requests.log
│
└── package.json
```

---

## 🚀 Features
- Create, update, delete products  
- Fetch product list & single product  
- Adjust product stock (used by Order Service)  
- Automatic logging using custom middleware  
- Prisma schema-based database integration  

---

## 🛠️ Installation

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Configure database  
Edit `.env` inside the **prisma/** folder:

```
DATABASE_URL="postgresql://user:password@localhost:5432/productdb"
```

### 3️⃣ Push Prisma schema
```bash
npx prisma migrate dev
```

---

## ▶️ Running the Service
```bash
npm run start:dev
```

The service runs on:
```
http://localhost:3001
```

---

## 📘 API Endpoints

### 🔹 Get all products
```
GET /products
```

### 🔹 Get product by ID
```
GET /products/:id
```

### 🔹 Create product
```
POST /products
```

### 🔹 Update product
```
PUT /products/:id
```

### 🔹 Delete product
```
DELETE /products/:id
```

### 🔹 Adjust stock (used by Order Service)
```
POST /products/:id/adjust-stock
Body: { "stock": -2 }
```

---

## 🧩 Middleware Used

### `logger.middleware.ts`
Logs:
- Method  
- URL  
- Timestamp  

Output goes into:
```
logs/requests.log
```

---

## 🧱 Prisma Schema (Simplified)

```prisma
model Product {
  id         Int     @id @default(autoincrement())
  name       String
  priceCents Int
  stock      Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

## 🤝 Communication with Other Services
Order Service communicates with:
```
POST /products/:id/adjust-stock
```
This enables stock reservation during order creation.


