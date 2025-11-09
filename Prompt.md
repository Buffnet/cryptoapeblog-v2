# PayloadCMS + Next.js + MongoDB + Vercel Task

**Goal:**  
Create a small full-stack app using **Next.js + PayloadCMS** with **MongoDB Atlas** and deploy it to **Vercel**.  
You will have:
- a Payload admin panel,
- collections for users, categories, and posts,
- relationships between them,
- login via Server Actions,
- post creation form, and
- a post list on the frontend.

Target user for login:  
```
test@test.com / test
```

Estimated time: **3–4 hours** (assuming you’re new to PayloadCMS).

---

## 🧩 Phase 0 — Overview

**Stack:**
- Frontend: Next.js (TypeScript, App Router)
- Backend: PayloadCMS (Headless CMS)
- Database: MongoDB Atlas
- Hosting: Vercel

**Final collections:**
- `users`
- `categories`
- `posts`

---

## ⚙️ Phase 1 — Initialize the Repository

1. Create a GitHub repo: `payload-next-task`.
2. Scaffold the project:
   ```bash
   npx create-next-app@latest payload-next-task --ts --eslint --app
   cd payload-next-task
   npm i payload next-payload mongodb dotenv
   npm i -D @types/node
   ```
3. Minimal structure:
   ```
   /app
     /(site)/page.tsx
   /payload
     /collections
       Users.ts
       Categories.ts
       Posts.ts
     config.ts
   /server/actions
     authorizeUser.ts
     createPost.ts
   .env.local
   ```

---

## 🧱 Phase 2 — MongoDB + Environment Variables

1. Create a **MongoDB Atlas** cluster → database `payload`.
2. Get your connection string `MONGODB_URI`.
3. Generate a secret:
   ```bash
   openssl rand -hex 32
   ```
4. Add `.env.local`:
   ```bash
   MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/payload?retryWrites=true&w=majority"
   PAYLOAD_SECRET="<hex-string>"
   NEXT_PUBLIC_PAYLOAD_URL="http://localhost:3000"
   PAYLOAD_CONFIG_PATH=./payload/config.ts
   ```

---

## ⚙️ Phase 3 — Payload Configuration

**File:** `/payload/config.ts`
```ts
import path from "path";
import { buildConfig } from "payload/config";
import { Users } from "./collections/Users";
import { Posts } from "./collections/Posts";
import { Categories } from "./collections/Categories";

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL,
  admin: { user: "users" },
  collections: [Users, Categories, Posts],
  db: { url: process.env.MONGODB_URI! },
  typescript: { outputFile: path.resolve(process.cwd(), "payload-types.ts") },
});
```

---

## 👤 Phase 4 — Collections and Relationships

### `/payload/collections/Users.ts`
```ts
import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  fields: [{ name: "displayName", type: "text", required: true }],
};
```

### `/payload/collections/Categories.ts`
```ts
import { CollectionConfig } from "payload/types";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "content", type: "richText" },
    { name: "owner", type: "relationship", relationTo: "users", required: true },
    {
      name: "posts",
      type: "join",
      collection: "posts",
      on: { field: "categories" },
      admin: { readOnly: true },
    },
  ],
};
```

### `/payload/collections/Posts.ts`
```ts
import { CollectionConfig } from "payload/types";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
    },
    { name: "content", type: "richText" },
    { name: "owner", type: "relationship", relationTo: "users", required: true },
  ],
};
```

---

## 🧠 Phase 5 — Next.js Integration

**`next.config.js`**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
};
module.exports = nextConfig;
```

Run locally:
```bash
npm run dev
```

---

## 🔐 Phase 6 — Server Actions

### `/server/actions/authorizeUser.ts`
```ts
"use server";
import { cookies } from "next/headers";

export async function authorizeUser(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  cookies().set("payload-token", data.token, { httpOnly: true, path: "/" });
  return data.user;
}
```

### `/server/actions/createPost.ts`
```ts
"use server";
import { cookies } from "next/headers";
import slugify from "slugify";

export async function createPost(formData: FormData) {
  const token = cookies().get("payload-token")?.value;
  if (!token) throw new Error("Not authorized");

  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const categories = formData.getAll("categories");
  const slug = slugify(title, { lower: true, strict: true });

  const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ title, slug, content, categories }),
  });

  if (!res.ok) throw new Error("Failed to create post");
  return await res.json();
}
```

---

## 🖥️ Phase 7 — Frontend (Login + Post Form + Posts List)

**File:** `/app/(site)/page.tsx`
```tsx
"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/categories`)
      .then(r => r.json()).then(d => setCategories(d.docs || []));
    fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/posts?depth=1`)
      .then(r => r.json()).then(d => setPosts(d.docs || []));
  }, []);

  async function onLogin(e: any) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { authorizeUser } = await import("@/server/actions/authorizeUser");
    const u = await authorizeUser(formData);
    setUser(u);
  }

  async function onCreatePost(e: any) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { createPost } = await import("@/server/actions/createPost");
    await createPost(formData);
    const d = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/posts?depth=1`).then(r => r.json());
    setPosts(d.docs || []);
    e.currentTarget.reset();
  }

  return (
    <main className="max-w-2xl mx-auto py-10 space-y-8">
      {!user && (
        <form onSubmit={onLogin} className="space-y-3 border p-4 rounded">
          <h2>Login</h2>
          <input name="email" defaultValue="test@test.com" placeholder="Email" className="border p-2 w-full" />
          <input type="password" name="password" defaultValue="test" placeholder="Password" className="border p-2 w-full" />
          <button className="border px-4 py-2 rounded">Login</button>
        </form>
      )}

      {user && <div className="p-4 border rounded">Hello, <b>{user.displayName || user.email}</b></div>}

      {user && (
        <form onSubmit={onCreatePost} className="space-y-3 border p-4 rounded">
          <h2>Create Post</h2>
          <input name="title" className="border p-2 w-full" placeholder="Title" required />
          <textarea name="content" className="border p-2 w-full" placeholder="Content" />
          <label>Categories</label>
          <div className="flex gap-3 flex-wrap">
            {categories.map(c => (
              <label key={c.id}>
                <input type="checkbox" name="categories" value={c.id} /> {c.title}
              </label>
            ))}
          </div>
          <button className="border px-4 py-2 rounded">Submit</button>
        </form>
      )}

      <section>
        <h3>Posts</h3>
        {posts.map(p => (
          <article key={p.id} className="border p-3 rounded my-2">
            <div><strong>{p.title}</strong></div>
            {p.categories?.length > 0 && (
              <div>Categories: {p.categories.map((c:any)=>c?.title).join(", ")}</div>
            )}
            <div>{p.content?.[0]?.children?.[0]?.text ?? ""}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
```

---

## 🧑‍💼 Phase 8 — Admin & Test User

1. Run locally:
   ```bash
   npm run dev
   ```
2. Open `/admin` → create the **first admin user**.
3. Log in as admin and create:
   - `test@test.com / test`
   - Add a few categories manually.

---

## ☁️ Phase 9 — Deploy to Vercel

1. Push code to GitHub.
2. Import the repo into **Vercel**.
3. Add **Environment Variables**:
   - `MONGODB_URI`
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_PAYLOAD_URL=https://your-vercel-domain.vercel.app`
   - `PAYLOAD_CONFIG_PATH=./payload/config.ts`
4. Build Command: `next build`
5. After deployment:
   - `/admin` → Payload admin panel
   - `/` → login page with post creation and list

---

## ✅ Phase 10 — Acceptance Checklist

- [ ] Payload admin panel working (`/admin`)
- [ ] Collections: `users`, `categories`, `posts`
- [ ] Relationship fields set correctly
- [ ] Login with `test@test.com / test` shows “Hello, test”
- [ ] `createPost` Server Action works
- [ ] Posts display below the form
- [ ] Deployed on Vercel using MongoDB Atlas

---

### 🏁 Deliverables

- ✅ Deployed URL on **Vercel**
- ✅ Working **Payload admin panel**
- ✅ Frontend with login, post form, and post list
- ✅ Public GitHub repository (Next.js + PayloadCMS)
