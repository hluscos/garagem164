"use client";

import { useState } from "react";

export default function NewsletterUnsubscribe({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function unsubscribe() {
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível cancelar a subscrição.");
      }

      setStatus("success");
      setMessage(result.message || "A subscrição foi cancelada.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar a subscrição.",
      );
    }
  }

  return (
    <div className="mt-8">
      {status === "success" ? (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-emerald-300">
          {message}
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={unsubscribe}
            disabled={status === "submitting"}
            className="rounded-xl bg-[#ffb800] px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-[#ffc533] disabled:cursor-wait disabled:opacity-60"
          >
            {status === "submitting" ? "A cancelar" : "Cancelar subscrição"}
          </button>
          {status === "error" && (
            <p aria-live="polite" className="mt-4 text-sm text-red-400">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
