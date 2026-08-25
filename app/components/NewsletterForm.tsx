"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          website: formData.get("website"),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível concluir a subscrição.");
      }

      setEmail("");
      setConsent(false);
      setStatus("success");
      setMessage(result.message || "Subscrição efetuada com sucesso.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a subscrição.",
      );
    }
  }

  return (
    <div>
      <h4 className="text-sm font-black uppercase tracking-[2px] text-[#ffb800]">
        Newsletter
      </h4>
      <p className="mt-5 text-sm leading-relaxed text-zinc-400">
        Recebe novidades, novos anúncios, leilões e sorteios.
      </p>

      <form className="mt-4" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email para a newsletter
        </label>
        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black focus-within:border-[#ffb800]/70">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="O teu email"
            autoComplete="email"
            required
            maxLength={254}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-[#ffb800] px-4 text-xs font-black uppercase text-black transition hover:bg-[#ffc533] disabled:cursor-wait disabled:opacity-60"
          >
            {status === "submitting" ? "A enviar" : "Subscrever"}
          </button>
        </div>

        <div className="absolute -left-[10000px]" aria-hidden="true">
          <label htmlFor="newsletter-website">Website</label>
          <input
            id="newsletter-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-zinc-500">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            className="mt-0.5 accent-[#ffb800]"
          />
          <span>
            Aceito receber comunicações da Garagem164 e li a{" "}
            <Link href="/privacy" className="text-zinc-300 underline hover:text-white">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        <p
          aria-live="polite"
          className={`mt-3 min-h-5 text-xs ${
            status === "error" ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      </form>
    </div>
  );
}
