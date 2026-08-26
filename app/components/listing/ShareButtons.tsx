"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";

type ShareButtonsProps = {
  title: string;
  className?: string;
};

export default function ShareButtons({
  title,
  className = "",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function openShare(service: "facebook" | "whatsapp") {
    const shareUrl = getShareUrl();
    const destination =
      service === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        : `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

    window.open(destination, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const buttonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:-translate-y-0.5 hover:border-[#ffb800]/50 hover:text-white";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => openShare("facebook")}
        aria-label="Partilhar no Facebook"
        title="Partilhar no Facebook"
        className={buttonClass}
      >
        <FaFacebookF className="text-[16px] text-[#1877F2]" />
      </button>

      <button
        type="button"
        onClick={() => openShare("whatsapp")}
        aria-label="Partilhar no WhatsApp"
        title="Partilhar no WhatsApp"
        className={buttonClass}
      >
        <FaWhatsapp className="text-[18px] text-[#25D366]" />
      </button>

      <button
        type="button"
        onClick={copyLink}
        className={buttonClass}
        aria-label="Copiar link do anúncio"
        title={copied ? "Link copiado" : "Copiar link"}
      >
        {copied ? (
          <Check size={17} className="text-[#ffb800]" />
        ) : (
          <Link2 size={17} />
        )}
      </button>
    </div>
  );
}
