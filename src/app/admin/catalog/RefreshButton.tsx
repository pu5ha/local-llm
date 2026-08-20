"use client";

import { useState } from "react";

export default function RefreshButton({ adminKey }: { adminKey: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const refresh = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={refresh}
        disabled={status === "loading"}
        className="btn-secondary"
      >
        {status === "loading" ? "Refreshing…" : "Refresh now"}
      </button>
      {status === "done" && (
        <span className="text-sm text-primary">Done — reload to see fresh data.</span>
      )}
      {status === "error" && (
        <span className="text-sm text-accent">Refresh failed.</span>
      )}
    </div>
  );
}
