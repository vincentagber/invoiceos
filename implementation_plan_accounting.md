# Implementation Plan - Accounting & Tax Features

## 1. Database Schema Updates
We need to track **expenses** and **tax settings** to provide accounting features.

### New Tables
- **`expenses`**: Tracks business spending.
  - `id`, `user_id`, `category` (e.g., Marketing, Software), `amount`, `date`, `merchant`, `receipt_url`.
- **`tax_settings`**: Stores user's tax profile.
  - `estimated_tax_rate` (default 25%), `filing_currency`, `tax_id`.

## 2. Backend API (PHP)
We will create a new `api/accounting` endpoint group.

- **`GET /api/accounting/summary`**:
  - aggregates `invoices` (paid) as **Revenue**.
  - aggregates `expenses` as **Expenses**.
  - Returns `gross_revenue`, `total_expenses`, `net_profit`, `profit_margin`.
- **`GET /api/accounting/expenses`**: List expenses.
- **`POST /api/accounting/expenses`**: Add a new expense.
- **`GET /api/accounting/taxes`**:
  - Calculates estimated tax based on `net_profit * tax_rate`.

## 3. Frontend (Next.js)
We will add two new "Pro" modules to the sidebar.

### A. Accounting Dashboard (`/dashboard/accounting`)
*   **Visuals**: Dark/Premium card design (Glassmorphism).
*   **Key Metrics**:
    *   **Cash Flow**: Green arrow up / Red arrow down.
    *   **Profit & Loss**: Real-time calculation.
*   **Charts**:
    *   **Money In vs. Money Out**: Bar chart (using `recharts`).
    *   **Expense Breakdown**: Donut chart (by category).
*   **Expense Manager**: A clean table to add/view expenses.

### B. Tax Filing Center (`/dashboard/taxes`)
*   **Tax Liability Widget**: "You have set aside $X for taxes".
*   **Tax Year Countdown**: "X days left in tax year".
*   **Export for Accountant**: Button to download comprehensive CSV of all invoices + expenses.
