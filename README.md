# Redis Distributed Lock Example (Node.js + PostgreSQL + Redis)

This project demonstrates how to build a simple real-time API using:

* 🚀 Express.js
* 🐘 PostgreSQL (to store product data)
* 🧠 Redis (to implement a distributed lock and avoid race conditions)

## 🔧 Features

* Concurrent-safe endpoint for purchasing a product
* Prevents overselling by using Redis locks
* Retry logic when the lock is already held

---

## 📦 Requirements

* Node.js >= 14
* PostgreSQL
* Redis Server

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/redis-lock-example.git
cd redis-lock-example
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL and create database

Use `psql` or any GUI like pgAdmin:

```sql
CREATE DATABASE redisdistributedlock;

\c redisdistributedlock

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  amount INTEGER
);

INSERT INTO products (name, amount) VALUES ('Sample Product', 5);
```

### 4. Start Redis server

```bash
redis-server
```

If it's already running, skip this step.

---

## 🚀 Run the App

```bash
node index.js
```

The server will start at:

```
http://localhost:3000
```

---

## 📬 Test the `/buy/:id` endpoint

Send a POST request:

```bash
curl -X POST http://localhost:3000/buy/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}'
```

---

## ⚙️ How Redis Lock Works

When a user tries to buy a product:

1. Redis tries to acquire a lock for the product (e.g., `lock:product:1`)
2. If the lock is free, it allows the operation and updates the database
3. If the lock is already taken, it retries a few times before failing
4. After the operation, the lock is released manually

This protects against race conditions when multiple users act at the same time.

---

## 📁 File Structure

```
.
├── index.js          # Main server file
├── package.json
└── README.md
```

---

## ✅ Author

Made with ❤️ by [Fateme](https://github.com/your-profile)
