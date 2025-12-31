# OpenAI ChatKit – Frontend Embed Reference

This reference document supports the `openai-chatkit-frontend-embed` Skill.
It standardizes **how you embed and configure ChatKit UI in a web frontend**
(Next.js / React / TS) for both **hosted workflows** and **custom backend**
setups.

The goal: give students and developers a **single, opinionated pattern** for
wiring ChatKit into their apps in a secure and maintainable way.

---

## 1. Scope of This Reference

This file focuses on the **frontend layer only**:

- How to install and import ChatKit JS/React packages.
- How to configure ChatKit for:
  - Hosted workflows (Agent Builder).
  - Custom backend (`api.url`, `fetch`, `uploadStrategy`, `domainKey`).
- How to pass auth and metadata from frontend → backend.
- How to debug common UI problems.

Anything related to **ChatKit backend behavior** (Python, Agents SDK, tools,
business logic, etc.) belongs in the backend Skill/reference.

---

## 2. Typical Frontend Stack Assumptions

This reference assumes a modern TypeScript stack, for example:

- **Next.js (App Router)** or
- **React (Vite/CRA)**

with:

- `NODE_ENV`-style environment variables (e.g. `NEXT_PUBLIC_*`).
- A separate **backend** domain or route (e.g. `https://api.example.com`
  or `/api/chatkit` proxied to a backend).

We treat ChatKit’s official package(s) as the source of truth for:

- Import paths,
- Hooks/components,
- Config shapes.

When ChatKit’s official API changes, update this reference accordingly.

---

## 3. Installation & Basic Imports

You will usually install a ChatKit package from npm, for example:

```bash
npm install @openai/chatkit
# or a React-specific package such as:
npm install @openai/chatkit-react
```

> Note: Package names can evolve. Always confirm the exact name in the
> official ChatKit docs for your version.

Basic patterns:

```ts
// Example: using a ChatKit client factory or React provider
import { createChatKitClient } from "@openai/chatkit"; // example name
// or
import { ChatKitProvider, ChatKitWidget } from "@openai/chatkit-react";
```

This Skill and reference do **not** invent APIs; they adapt to whichever
client/React API the docs specify for the version you are using.

---

## 4. Two Main Modes: Hosted vs Custom Backend

### 4.1 Hosted Workflow Mode (Agent Builder)

In this mode:

- ChatKit UI talks directly to OpenAI’s backend.
- Your frontend needs:
  - A **workflow ID** (from Agent Builder, like `wf_...`).
  - A **client token** or client secret that your backend mints.
- The backend endpoint (e.g. `/api/chatkit/token`) usually:
  - Authenticates the user,
  - Calls OpenAI to create a short-lived token,
  - Sends that token back to the frontend.

Frontend config shape (conceptual):

```ts
const client = createChatKitClient({
  workflowId: process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID!,
  async getClientToken() {
    const res = await fetch("/api/chatkit/token", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch ChatKit token");
    const { clientSecret } = await res.json();
    return clientSecret;
  },
  // domainKey, theme, etc.
});
```

The logic of the conversation (tools, multi-agent flows, etc.) lives
primarily in **Agent Builder**, not in your code.

### 4.2 Custom Backend Mode (Your Own Server)

In this mode:

- ChatKit UI talks to **your backend** instead of OpenAI directly.
- Frontend config uses a custom `api.url` and usually a custom `fetch`.

High-level shape:

```ts
const client = createChatKitClient({
  api: {
    url: "https://api.example.com/chatkit/api",
    fetch: async (url, options) => {
      const accessToken = await getAccessTokenSomehow();
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
    },
    uploadStrategy: {
      type: "direct",
      uploadUrl: "https://api.example.com/chatkit/api/upload",
    },
    domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY,
  },
  // other ChatKit options...
});
```

In this setup:

- Your **backend** validates auth and talks to the Agents SDK.
- ChatKit UI stays “dumb” about models/tools and just displays messages.

**This reference prefers custom backend mode** for advanced use cases,
especially when using the Agents SDK with OpenAI/Gemini.

---

## 5. Core Config Concepts

Regardless of the exact ChatKit API, several config concepts recur.

### 5.1 api.url

- URL where the frontend sends ChatKit events.
- In custom backend mode it should point to your backend route, e.g.:
  - `https://api.example.com/chatkit/api` (public backend),
  - `/api/chatkit` (Next.js API route that proxies to backend).

You should **avoid** hardcoding environment-dependent URLs inline; instead,
use environment variables:

```ts
const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? "/api/chatkit";
```

### 5.2 api.fetch (Custom Fetch)

Custom fetch allows you to inject auth and metadata:

```ts
fetch: async (url, options) => {
  const token = await getAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      "X-User-Id": user.id,
      "X-Tenant-Id": tenantId,
    },
    credentials: "include",
  });
}
```

Key rules:

- **Never** send raw OpenAI/Gemini API keys from the frontend.
- Only send short-lived access tokens or session cookies.
- If multi-tenant, send tenant identifiers as headers, not in query strings.

### 5.3 uploadStrategy

Controls how file uploads are handled. In custom backend mode you typically
use **direct upload** to your backend:

```ts
uploadStrategy: {
  type: "direct",
  uploadUrl: CHATKIT_UPLOAD_URL, // e.g. "/api/chatkit/upload"
}
```

Backend responsibilities:

- Accept `multipart/form-data`,
- Store files (disk, S3, etc.),
- Return a JSON body with a public URL and metadata expected by ChatKit.

### 5.4 domainKey & Allowlisted Domains

- ChatKit often requires a **domain allowlist** to decide which origins
  are allowed to render the widget.
- A `domainKey` (or similar) is usually provided by OpenAI UI / dashboard.

On the frontend:

- Store it in `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` (or similar).
- Pass it through ChatKit config:

  ```ts
  domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY,
  ```

If the widget is blank or disappears, check:

- Is the origin (e.g. `https://app.example.com`) allowlisted?
- Is the `domainKey` correct and present?

---

## 6. Recommended Next.js Organization

For Next.js App Router (TypeScript), a common structure:

```text
src/
  app/
    chat/
      page.tsx          # Chat page using ChatKit
  components/
    chatkit/
      ChatKitProvider.tsx
      ChatKitWidget.tsx
      chatkitClient.ts  # optional client factory
```

### 6.1 ChatKitProvider.tsx (Conceptual)

- Wraps your chat tree with the ChatKit context/provider.
- Injects ChatKit client config in one place.

### 6.2 ChatKitWidget.tsx

- A focused component that renders the actual Chat UI.
- Receives props like `user`, `tenantId`, optional initial messages.

### 6.3 Environment Variables

Use `NEXT_PUBLIC_...` only for **non-secret** values:

- `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY`
- `NEXT_PUBLIC_CHATKIT_API_URL`
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` (if using hosted workflows)

Secrets belong on the backend side.

---

## 7. Debugging & Common Issues

### 7.1 Widget Not Showing / Blank

Checklist:

1. Check browser console for errors.
2. Confirm correct import paths / package versions.
3. Verify **domain allowlist** and `domainKey` configuration.
4. Check network tab:
   - Are `chatkit` requests being sent?
   - Any 4xx/5xx or CORS errors?
5. If using custom backend:
   - Confirm the backend route exists and returns a valid response shape.

### 7.2 “Loading…” Never Finishes

- Usually indicates backend is not returning expected structure or stream.
- Add logging to backend for incoming ChatKit events and outgoing responses.
- Temporarily log responses on the frontend to inspect their shape.

### 7.3 File Uploads Fail

- Ensure `uploadUrl` points to a backend route that accepts `multipart/form-data`.
- Check response body shape matches ChatKit’s expectation (URL field, etc.).
- Inspect network tab to confirm request/response.

### 7.4 Auth / 401 Errors

- Confirm that your custom `fetch` attaches the correct token or cookie.
- Confirm backend checks that token and does not fail with generic 401/403.
- In dev, log incoming headers on backend for debugging (but never log
  secrets to console in production).

---

## 8. Evolving with ChatKit Versions

ChatKit’s API may change over time (prop names, hooks, config keys). To keep
this Skill and your code up to date:

- Treat **official ChatKit docs** as the top source of truth for frontend
  API details.
- If you have ChatKit docs via MCP (e.g. `chatkit/frontend/latest.md`,
  `chatkit/changelog.md`), prefer them over older examples.
- When you detect a mismatch (e.g. a prop is renamed or removed):
  - Update your local templates/components.
  - Update this reference file.

A good practice is to maintain a short local changelog next to this file
documenting which ChatKit version the examples were last validated against.

---

## 9. Teaching & Best Practices Summary

When using this Skill and reference to teach students or onboard teammates:

- Start with a **simple, working embed**:
  - Hosted workflow mode OR
  - Custom backend that just echoes messages.
- Then layer in:
  - Auth header injection,
  - File uploads,
  - Multi-tenant headers,
  - Theming and layout.

Enforce these best practices:

- No API keys in frontend code.
- Single, centralized ChatKit config (not scattered across components).
- Clear separation of concerns:
  - Frontend: UI + ChatKit config.
  - Backend: Auth + business logic + Agents SDK.

By following this reference, the `openai-chatkit-frontend-embed` Skill can
generate **consistent, secure, and maintainable** ChatKit frontend code
across projects.
