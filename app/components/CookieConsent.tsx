"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const consentKey = "garagem164-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(consentKey);
    let showBanner: number | undefined;

    if (!savedChoice) {
      showBanner = window.setTimeout(() => setVisible(true), 0);
    }

    const openPreferences = () => setVisible(true);
    window.addEventListener("open-cookie-preferences", openPreferences);

    return () => {
      if (showBanner !== undefined) window.clearTimeout(showBanner);
      window.removeEventListener("open-cookie-preferences", openPreferences);
    };
  }, []);

  const saveChoice = (choice: ConsentChoice) => {
    window.localStorage.setItem(consentKey, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Preferências de cookies"
      className="fixed inset-x-4 bottom-4 z-[110] mx-auto max-w-5xl rounded-[26px] border border-white/10 bg-zinc-950 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffb800]/10 text-[#ffb800]">
            <Cookie size={21} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-black uppercase tracking-[0.5px]">
                A tua privacidade importa
              </h2>
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Fechar aviso de cookies"
                className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/5 hover:text-white lg:hidden"
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Utilizamos cookies essenciais para manter a plataforma segura e
              a sessão iniciada. Cookies opcionais só serão utilizados com a
              tua autorização. Consulta a nossa{" "}
              <Link
                href="/cookies"
                className="font-bold text-white underline decoration-[#ffb800] underline-offset-4 transition hover:text-[#ffb800]"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-6 text-[11px] font-black uppercase tracking-[1px] text-white transition hover:border-white/30"
          >
            Recusar opcionais
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#ffb800] px-6 text-[11px] font-black uppercase tracking-[1px] text-black transition hover:bg-[#ffc933]"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </aside>
  );
}
