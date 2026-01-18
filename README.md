# Superlink Invoice

![GitHub License](https://img.shields.io/github/license/vincentagber/superlinkInvoice)
![GitHub Stars](https://img.shields.io/github/stars/vincentagber/superlinkInvoice?style=social)
![GitHub Forks](https://img.shields.io/github/forks/vincentagber/superlinkInvoice?style=social)

---

## 📖 Overview

**Superlink Invoice** is a modern, lightweight invoicing web application built with a clean, premium UI that makes creating, managing, and sending invoices a breeze. It offers a seamless experience for freelancers, small businesses, and agencies looking for a fast‑track solution without the overhead of heavyweight accounting software.

---

## ✨ Features

- **Intuitive Dashboard** – Real‑time stats on invoices, payments, and overdue items.
- **Responsive Design** – Works beautifully on desktop, tablet, and mobile devices.
- **Dynamic PDF Generation** – Export invoices as high‑quality PDFs with brand‑customizable templates.
- **Secure Authentication** – JWT‑based login with role‑based access control.
- **Multi‑Currency Support** – Handle invoices in various currencies with automatic conversion.
- **Rich API** – RESTful endpoints for integration with third‑party services.
- **Premium UI** – Glass‑morphism, subtle micro‑animations, and a dark‑mode ready design.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (TSX), Vite, Vanilla CSS with custom design tokens, modern typography (Google Font **Inter**) |
| **Backend** | PHP (MAMP), MySQL, JWT authentication |
| **PDF Generation** | `dompdf` library |
| **Deployment** | Docker (optional), MAMP for local development |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **PHP** (>=8.0) with **Composer**
- **MySQL** (or MariaDB) running via MAMP

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vincentagber/superlinkInvoice.git
   cd superlinkInvoice
   ```
2. **Setup the backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env   # configure DB credentials
   php init_mysql_db.php   # creates tables and seed data
   ```
3. **Setup the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev   # starts Vite dev server on http://localhost:5173
   ```
4. **Open the app**
   Visit `http://localhost:5173` in your browser. The backend API runs on `http://localhost:8888` (default MAMP port).

---

## 📚 Usage

- **Register / Login** – Secure JWT authentication.
- **Create Invoice** – Fill out client details, items, and taxes. Preview before sending.
- **Send & Track** – Email the PDF directly from the app; monitor payment status.
- **Analytics** – Dashboard shows total revenue, pending invoices, and overdue alerts.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes with clear messages.
4. Open a Pull Request describing the changes.

Make sure to run the test suite (if applicable) and adhere to the existing code style.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👥 Credits

Developed significantly by **Vincent Agber**.

---

*This README was crafted to provide a polished, GitHub‑ready overview of the Superlink Invoice project.*
