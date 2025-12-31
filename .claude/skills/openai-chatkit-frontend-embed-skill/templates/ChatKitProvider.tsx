"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createChatKitClient } from "@openai/chatkit";

type ChatKitContextValue = {
  client: any;
};

const ChatKitContext = createContext<ChatKitContextValue | null>(null);

type Props = {
  accessToken: string;
  children: React.ReactNode;
};

export function ChatKitProvider({ accessToken, children }: Props) {
  const value = useMemo(() => {
    const client = createChatKitClient({
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_API_URL!,
        fetch: async (url, options) => {
          return fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${accessToken}`,
            },
          });
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
  if (!ctx) throw new Error("useChatKit must be used in provider");
  return ctx;
}
