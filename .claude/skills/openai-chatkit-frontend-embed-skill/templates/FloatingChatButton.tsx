"use client";

import { useState } from "react";
import { ChatKitWidget } from "./ChatKitWidget";

export function FloatingChatButton({ accessToken }: { accessToken: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-16 right-4 z-50 w-80 rounded-xl bg-white shadow-lg p-3">
          <ChatKitWidget />
        </div>
      )}

      <button
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 text-white px-4 py-2 shadow-lg"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Chat"}
      </button>
    </>
  );
}
