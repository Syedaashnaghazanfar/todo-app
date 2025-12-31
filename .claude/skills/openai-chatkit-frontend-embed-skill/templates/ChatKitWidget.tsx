"use client";

import React from "react";
import { useChatKit } from "./ChatKitProvider";

export function ChatKitWidget() {
  const { client } = useChatKit();

  return (
    <div className="border border-slate-200 p-2 rounded-lg">
      <p className="text-sm text-slate-500">
        ChatKit UI will render here with client instance.
      </p>
    </div>
  );
}
