# OpenAI ChatKit – Frontend Embed Examples (Next.js + TypeScript)

These examples support the `openai-chatkit-frontend-embed` Skill.

They focus on **Next.js App Router + TypeScript**, and assume you are using
either:

- **Custom backend mode** – ChatKit calls your `/chatkit/api` and `/chatkit/api/upload`
- **Hosted workflow mode** – ChatKit calls OpenAI’s backend via `workflowId` + client token

You can adapt these to plain React/Vite by changing paths and imports.

---

## Example 1 – Minimal Chat Page (Custom Backend Mode)

**Goal:** Add a ChatKit widget to `/chat` page using a custom backend.

```tsx
// app/chat/page.tsx
import ChatPageClient from "./ChatPageClient";

export default function ChatPage() {
  // Server component wrapper – keeps client-only logic separate
  return <ChatPageClient />;
}
```

```tsx
// app/chat/ChatPageClient.tsx
"use client";

import { useState } from "react";
import { ChatKitWidget } from "@/components/ChatKitWidget";

export default function ChatPageClient() {
  // In a real app, accessToken would come from your auth logic
  const [accessToken] = useState<string>("FAKE_TOKEN_FOR_DEV_ONLY");

  return (
    <div className="flex h-[100vh] items-center justify-center bg-slate-100">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow">
        <h1 className="mb-4 text-xl font-semibold">Support Chat</h1>
        <ChatKitWidget accessToken={accessToken} />
      </div>
    </div>
  );
}
```

---

## Example 2 – ChatKitWidget Component with Custom Backend Config

**Goal:** Centralize ChatKit config for custom backend mode.

```tsx
// components/ChatKitWidget.tsx
"use client";

import React, { useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit"; // adjust to real import

type ChatKitWidgetProps = {
  accessToken: string;
};

export function ChatKitWidget({ accessToken }: ChatKitWidgetProps) {
  const client = useMemo(() => {
    return createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: async (url, options) => {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return res;
        },
        uploadStrategy: {
          type: "direct",
          uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
        },
        domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
      },
    });
  }, [accessToken]);

  // Replace <div> below with the actual ChatKit UI component
  return (
    <div className="border border-slate-200 p-2">
      {/* Example placeholder – integrate actual ChatKit chat UI here */}
      <p className="text-sm text-slate-500">
        ChatKit UI will render here using the client instance.
      </p>
    </div>
  );
}
```

---

## Example 3 – Hosted Workflow Mode with Client Token

**Goal:** Use ChatKit with an Agent Builder workflow ID and a backend-issued client token.

```tsx
// lib/chatkit/hostedClient.ts
import { createChatKitClient } from "@openai/chatkit";

export function createHostedChatKitClient() {
  return createChatKitClient({
    workflowId: process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID!,
    async getClientToken() {
      const res = await fetch("/api/chatkit/token", { method: "POST" });
      if (!res.ok) {
        console.error("Failed to fetch client token", res.status);
        throw new Error("Failed to fetch client token");
      }
      const { clientSecret } = await res.json();
      return clientSecret;
    },
  });
}
```

```tsx
// components/HostedChatWidget.tsx
"use client";

import React, { useMemo } from "react";
import { createHostedChatKitClient } from "@/lib/chatkit/hostedClient";

export function HostedChatWidget() {
  const client = useMemo(() => createHostedChatKitClient(), []);

  return (
    <div className="border border-emerald-300 p-2">
      <p className="text-sm text-emerald-700">
        Hosted ChatKit (Agent Builder workflow) will render here.
      </p>
    </div>
  );
}
```

---

## Example 4 – Central ChatKitProvider with Context

**Goal:** Provide ChatKit client via React context to nested components.

```tsx
// components/ChatKitProvider.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";

type ChatKitContextValue = {
  client: any; // replace with proper ChatKit client type
};

const ChatKitContext = createContext<ChatKitContextValue | null>(null);

type Props = {
  accessToken: string;
  children: React.ReactNode;
};

export function ChatKitProvider({ accessToken, children }: Props) {
  const value = useMemo<ChatKitContextValue>(() => {
    const client = createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: async (url, options) => {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return res;
        },
        uploadStrategy: {
          type: "direct",
          uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
        },
        domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
      },
    });
    return { client };
  }, [accessToken]);

  return (
    <ChatKitContext.Provider value={value}>
      {children}
    </ChatKitContext.Provider>
  );
}

export function useChatKit() {
  const ctx = useContext(ChatKitContext);
  if (!ctx) {
    throw new Error("useChatKit must be used within ChatKitProvider");
  }
  return ctx;
}
```

```tsx
// app/chat/page.tsx (using provider)
import ChatPageClient from "./ChatPageClient";

export default function ChatPage() {
  return <ChatPageClient />;
}
```

```tsx
// app/chat/ChatPageClient.tsx
"use client";

import { useState } from "react";
import { ChatKitProvider } from "@/components/ChatKitProvider";
import { ChatKitWidget } from "@/components/ChatKitWidget";

export default function ChatPageClient() {
  const [accessToken] = useState("FAKE_TOKEN_FOR_DEV_ONLY");
  return (
    <ChatKitProvider accessToken={accessToken}>
      <ChatKitWidget />
    </ChatKitProvider>
  );
}
```

---

## Example 5 – Passing Tenant & User Context via Headers

**Goal:** Provide `userId` and `tenantId` to the backend through headers.

```ts
// lib/chatkit/makeFetch.ts
export function makeChatKitFetch(
  accessToken: string,
  userId: string,
  tenantId: string
) {
  return async (url: string, options: RequestInit) => {
    const headers: HeadersInit = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      "X-User-Id": userId,
      "X-Tenant-Id": tenantId,
    };

    const res = await fetch(url, { ...options, headers });
    return res;
  };
}
```

```tsx
// components/ChatKitWidget.tsx (using makeChatKitFetch)
"use client";

import React, { useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";
import { makeChatKitFetch } from "@/lib/chatkit/makeFetch";

type Props = {
  accessToken: string;
  userId: string;
  tenantId: string;
};

export function ChatKitWidget({ accessToken, userId, tenantId }: Props) {
  const client = useMemo(() => {
    return createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: makeChatKitFetch(accessToken, userId, tenantId),
        uploadStrategy: {
          type: "direct",
          uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
        },
        domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
      },
    });
  }, [accessToken, userId, tenantId]);

  return <div>{/* Chat UI here */}</div>;
}
```

---

## Example 6 – Simple Debug Logging Wrapper Around fetch

**Goal:** Log ChatKit network requests in development.

```ts
// lib/chatkit/debugFetch.ts
export function makeDebugChatKitFetch(accessToken: string) {
  return async (url: string, options: RequestInit) => {
    const headers: HeadersInit = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    };

    console.debug("[ChatKit] Request:", url, { ...options, headers });

    const res = await fetch(url, { ...options, headers });

    console.debug("[ChatKit] Response:", res.status, res.statusText);
    return res;
  };
}
```

```tsx
// components/ChatKitWidget.tsx (using debug fetch in dev)
"use client";

import React, { useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";
import { makeDebugChatKitFetch } from "@/lib/chatkit/debugFetch";

type Props = {
  accessToken: string;
};

export function ChatKitWidget({ accessToken }: Props) {
  const client = useMemo(() => {
    const baseFetch =
      process.env.NODE_ENV === "development"
        ? makeDebugChatKitFetch(accessToken)
        : async (url: string, options: RequestInit) =>
            fetch(url, {
              ...options,
              headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${accessToken}`,
              },
            });

    return createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: baseFetch,
        uploadStrategy: {
          type: "direct",
          uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
        },
        domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
      },
    });
  }, [accessToken]);

  return <div>{/* Chat UI goes here */}</div>;
}
```

---

## Example 7 – Layout Integration

**Goal:** Show a persistent ChatKit button in the main layout.

```tsx
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App with ChatKit",
  description: "Example app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* ChatKit toggle / floating button could go here */}
        <div id="chatkit-floating-entry" />
      </body>
    </html>
  );
}
```

```tsx
// components/FloatingChatButton.tsx
"use client";

import { useState } from "react";
import { ChatKitWidget } from "@/components/ChatKitWidget";

export function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const accessToken = "FAKE_TOKEN_FOR_DEV_ONLY";

  return (
    <>
      {open && (
        <div className="fixed bottom-16 right-4 z-50 w-80 rounded-xl bg-white shadow-xl">
          <ChatKitWidget accessToken={accessToken} />
        </div>
      )}
      <button
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Close chat" : "Chat with us"}
      </button>
    </>
  );
}
```

Use `<FloatingChatButton />` in a client layout or a specific page.

---

## Example 8 – Environment Variables Setup

**Goal:** Show required env vars for custom backend mode.

```dotenv
# .env.local (Next.js)
NEXT_PUBLIC_CHATKIT_API_URL=https://localhost:8000/chatkit/api
NEXT_PUBLIC_CHATKIT_UPLOAD_URL=https://localhost:8000/chatkit/api/upload
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=dev-domain-key-123

# Server-only vars live here too but are not exposed as NEXT_PUBLIC_*
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

Remind students:

- Only `NEXT_PUBLIC_*` is visible to the browser.
- API keys must **never** be exposed via `NEXT_PUBLIC_*`.

---

## Example 9 – Fallback UI When ChatKit Client Fails

**Goal:** Gracefully handle ChatKit client creation errors.

```tsx
// components/SafeChatKitWidget.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createChatKitClient } from "@openai/chatkit";

type Props = {
  accessToken: string;
};

export function SafeChatKitWidget({ accessToken }: Props) {
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => {
    try {
      return createChatKitClient({
        api: {
          url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
          fetch: async (url, options) => {
            const res = await fetch(url, {
              ...options,
              headers: {
                ...(options?.headers || {}),
                Authorization: `Bearer ${accessToken}`,
              },
            });
            return res;
          },
          uploadStrategy: {
            type: "direct",
            uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
          },
          domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
        },
      });
    } catch (e: any) {
      console.error("Failed to create ChatKit client", e);
      setError("Chat is temporarily unavailable.");
      return null;
    }
  }, [accessToken]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!client) {
    return <p className="text-sm text-slate-500">Initializing chat...</p>;
  }

  return <div>{/* Chat UI here */}</div>;
}
```

---

## Example 10 – Toggling Between Hosted Workflow and Custom Backend

**Goal:** Allow switching modes with a simple flag (for teaching).

```tsx
// components/ModeSwitchChatWidget.tsx
"use client";

import React, { useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";

type Props = {
  mode: "hosted" | "custom";
  accessToken: string;
};

export function ModeSwitchChatWidget({ mode, accessToken }: Props) {
  const client = useMemo(() => {
    if (mode === "hosted") {
      return createChatKitClient({
        workflowId: process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID!,
        async getClientToken() {
          const res = await fetch("/api/chatkit/token", { method: "POST" });
          const { clientSecret } = await res.json();
          return clientSecret;
        },
      });
    }

    // custom backend
    return createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: async (url, options) => {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return res;
        },
        uploadStrategy: {
          type: "direct",
          uploadUrl: process.env.NEXT_PUBLIC_CHATKIT_UPLOAD_URL!,
        },
        domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY!,
      },
    });
  }, [mode, accessToken]);

  return <div>{/* Chat UI based on client */}</div>;
}
```

---

## Example 11 – Minimal React (Non-Next.js) Integration

**Goal:** Show how to adapt to a plain React/Vite setup.

```tsx
// src/ChatKitWidget.tsx
"use client";

import React, { useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";

type Props = {
  accessToken: string;
};

export function ChatKitWidget({ accessToken }: Props) {
  const client = useMemo(() => {
    return createChatKitClient({
      api: {
        url: import.meta.env.VITE_CHATKIT_API_URL,
        fetch: async (url, options) => {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return res;
        },
        uploadStrategy: {
          type: "direct",
          uploadUrl: import.meta.env.VITE_CHATKIT_UPLOAD_URL,
        },
        domainKey: import.meta.env.VITE_CHATKIT_DOMAIN_KEY,
      },
    });
  }, [accessToken]);

  return <div>{/* Chat UI */}</div>;
}
```

```tsx
// src/App.tsx
import { useState } from "react";
import { ChatKitWidget } from "./ChatKitWidget";

function App() {
  const [token] = useState("FAKE_TOKEN_FOR_DEV_ONLY");
  return (
    <div>
      <h1>React + ChatKit</h1>
      <ChatKitWidget accessToken={token} />
    </div>
  );
}

export default App;
```

These examples together cover a full range of **frontend ChatKit patterns**
for teaching, debugging, and production integration.
