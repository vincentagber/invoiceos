# Vercel Deployment Guide for InvoiceOS

To deploy the InvoiceOS frontend to Vercel, follow these steps:

### 1. Vercel Dashboard Setup
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Select your `invoiceOS` repository.
4. **IMPORTANT**: In the "Project Settings":
   - Set **Root Directory** to `frontend`.
   - Ensure the **Framework Preset** is set to **Next.js**.

### 2. Environment Variables
Add the following Environment Variables in the Vercel dashboard (Settings > Environment Variables):

| Key | Value (Example) |
|-----|-------|
| `NEXT_PUBLIC_USE_NODE` | `true` |
| `NEXT_PUBLIC_NODE_API_URL` | `https://your-backend.render.com/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |

### 3. Backend CORS Note
Ensure your backend (wherever it is hosted) has CORS enabled for your Vercel URL. Currently, the backend is configured to allow all origins (`origin: '*'`), which is suitable for testing.

### 4. Build Commands
The default build commands in Vercel will work perfectly:
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`
