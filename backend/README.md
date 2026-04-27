# ⚙️ invoiceOS Backend

The robust engine powering invoiceOS, built with Node.js, Express, and Prisma.

## 🏗 Architecture
- **API**: RESTful API with Express.
- **ORM**: Prisma for type-safe database access.
- **Database**: PostgreSQL (Production) / SQLite (Development).
- **Authentication**: JWT-based secure sessions.

## 🧠 AI & Intelligence
- **OpenAI Integration**: Provides intelligent autofill and financial analysis features.
- **Data Validation**: Strict schema validation using Zod.

## 🛠 Features
- **Invoice Logic**: Complex calculation engine for taxes, discounts, and totals.
- **Analytics API**: Aggregates financial data for the frontend dashboard.
- **Socket.io**: Ready for real-time notification and update streams.

## 🚀 Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`

3. **Database Migration**
   ```bash
   npx prisma migrate dev
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```
