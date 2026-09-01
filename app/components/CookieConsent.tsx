"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const consentKey = "garagem164-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

function removeAnalyticsCookies() {
  const hostname = window.location.hostname;
  const domainParts = hostname.split(".");
  const rootDomain =
    domainParts.length > 1 ? `.${domainParts.slice(-2).join(".")}` : hostname;

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();

    if (!name?.startsWith("_ga")) return;

    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${rootDomain}; SameSite=Lax`;
  });
}

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
    const previousChoice = window.localStorage.getItem(consentKey);
    window.localStorage.setItem(consentKey, choice);

    if (choice === "rejected") {
      removeAnalyticsCookies();
    }

    window.dispatchEvent(new Event("cookie-consent-changed"));
    setVisible(false);

    if (choice === "rejected" && previousChoice === "accepted") {
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-5xl rounded-[22px] border border-white/10 bg-zinc-950 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:inset-x-4 sm:bottom-4 sm:rounded-[26px] sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffb800]/10 text-[#ffb800] sm:h-11 sm:w-11 sm:rounded-2xl">
            <Cookie size={21} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.5px] sm:text-base">
                A tua privacidade importa
              </h2>
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Fechar aviso de cookies"
                className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden"
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-300 sm:text-sm">
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

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-3 text-center text-[10px] font-black uppercase tracking-[0.5px] text-white transition hover:border-white/30 sm:h-12 sm:rounded-2xl sm:px-6 sm:text-[11px] sm:tracking-[1px]"
          >
            Recusar opcionais
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ffb800] px-3 text-center text-[10px] font-black uppercase tracking-[0.5px] text-black transition hover:bg-[#ffc933] sm:h-12 sm:rounded-2xl sm:px-6 sm:text-[11px] sm:tracking-[1px]"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </aside>
  );
}
