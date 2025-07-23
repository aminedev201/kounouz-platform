# 🛍️ Kounouz Platform

**Kounouz** is a modern multi-role e-commerce platform that connects users and vendors. Users can browse and order products, while vendors manage their products and handle customer orders — all within a sleek and responsive interface.

---

## 🌐 Tech Stack

| Layer            | Technology                      |
| ---------------- | ------------------------------- |
| Frontend         | Next.js (React)                 |
| Backend          | Symfony (API Platform)          |
| Styling          | Tailwind CSS                    |
| Auth             | JWT Token-based Authentication  |
| Storage          | File Uploads via UUID filenames |
| Containerization | Docker-ready                    |

---

## 👤 User Roles

### 🧑‍💻 User

* Register & login
* Browse and search products
* Place orders and track order status

### 🧑‍🔧 Vendor

* Register & login
* Add / edit / delete products
* View and manage customer orders

---

## 📁 Folder Structure

```
kounouz-platform/
├── client/   # Next.js frontend
├── server/   # Symfony backend (API)
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Project

```bash
git clone https://github.com/your-username/kounouz-platform.git
cd kounouz-platform
```

---

### 2. Frontend Setup (Next.js)

```bash
cd client
cp .env.local.example .env.local   # Create and configure your env file
npm install
npm run dev
```

* Visit: [http://localhost:3000](http://localhost:3000)

---

### 3. Backend Setup (Symfony API)

```bash
cd ../server
cp .env.local.example .env.local   # Create and configure your env file
composer install
symfony server:start
```

* API runs at: [http://localhost:8000](http://localhost:8000)

---

## 📦 Image Uploading

* Images (e.g., avatars, product photos) are uploaded to:

```
client/public/uploads/
```

Only the image **filename** (e.g., `uuid.jpg`) is stored and passed to the backend.

---

## 🔒 Authentication

* JWT-based
* Add token in API requests:

```http
Authorization: Bearer <token>
```

---

## 🔐 Environment Variables

Both frontend and backend require `.env.local` configuration.

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (.env.local)

```env
### configure JWT secrets, CORS origins, mailer etc.
CORS_ALLOW_ORIGIN=http://localhost:3000
```

---

## 📝 License

This project is licensed under the MIT License.

---

## ✨ Author

**Amine Fakkar**
GitHub: [@aminedev201](https://github.com/aminedev201)
