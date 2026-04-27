# 💠 invoiceOS

![invoiceOS Banner](/Users/macbookpro/.gemini/antigravity/brain/137ee655-001e-4259-b118-74cc337ec267/invoiceos_banner_1777284871239.png)

> **The Sovereign Intellect of Financial Management.** A premium, high-fidelity platform for seamless invoicing, expense tracking, and AI-driven business insights.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-blue?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

---

## ✨ Overview

**invoiceOS** is a sophisticated financial administrative console designed for modern businesses and freelancers. Built with the **Sovereign Clean** design philosophy, it prioritizes a premium user experience, deep-mode aesthetics, and efficient workflows.

From AI-powered document generation to real-time financial analytics, invoiceOS provides the tools needed to manage your business with surgical precision.

## 🚀 Key Features

- **📊 Dynamic Dashboard**: Real-time revenue visualization using Recharts with interactive financial insights.
- **📄 Professional Invoicing**: Create, manage, and track invoices with ease. Export to high-quality PDF.
- **🤖 AI-Powered Intelligence**: Automated data entry and intelligent financial suggestions powered by OpenAI.
- **💼 Client Management**: Centralized hub for client profiles, tax information, and transaction history.
- **🧾 Expense & Subscription Tracking**: Monitor your burn rate with dedicated modules for recurring subscriptions and one-off expenses.
- **💎 Sovereign UI**: A bespoke, high-fidelity design system featuring glassmorphism, fluid animations (Framer Motion), and a curated dark-mode palette.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **AI Integration**: [OpenAI API](https://openai.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or SQLite for development)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vincentagber/invoiceos.git
   cd invoiceos
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Add your DATABASE_URL and OPENAI_API_KEY
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 👤 Credits

Developed significantly by **Vincent Agber**.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
