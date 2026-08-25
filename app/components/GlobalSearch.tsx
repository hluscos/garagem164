"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

type ListingType = "sale" | "auction" | "raffle";

type SearchResult = {
  id: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  listing_type: ListingType;
  price: number | null;
  starting_bid: number | null;
  ticket_price: number | null;
  sale_status: string | null;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

type GlobalSearchProps = {
  open: boolean;
  onClose: () => void;
};

const resultSelect = `
  id,
  brand,
  model,
  category,
  listing_type,
  price,
  starting_bid,
  ticket_price,
  sale_status,
  listing_images (
    image_url,
    sort_order
  )
`;

const typeDetails: Record<
  ListingType,
  { label: string; route: string }
> = {
  sale: { label: "Anúncio", route: "/listing" },
  auction: { label: "Leilão", route: "/auctions" },
  raffle: { label: "Sorteio", route: "/raffles" },
};

function formatPrice(result: SearchResult) {
  const value =
    result.listing_type === "auction"
      ? result.starting_bid
      : result.listing_type === "raffle"
        ? result.ticket_price
        : result.price;

  if (value === null) return "Preço sob consulta";

  const formatted = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));

  return result.listing_type === "raffle"
    ? `${formatted} / bilhete`
    : formatted;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    const searchTerm = query
      .replace(/[%_,()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!open || searchTerm.length < 2) {
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(false);

      const searches = ["brand", "model", "category"].map((column) =>
        supabase
          .from("listings")
          .select(resultSelect)
          .ilike(column, `%${searchTerm}%`)
          .limit(8),
      );

      const responses = await Promise.all(searches);

      if (cancelled) return;

      if (responses.some((response) => response.error)) {
        console.error(
          "SEARCH ERROR:",
          responses.map((response) => response.error).filter(Boolean),
        );
        setResults([]);
        setError(true);
        setLoading(false);
        return;
      }

      const uniqueResults = new Map<string, SearchResult>();

      responses.forEach(({ data }) => {
        (data as SearchResult[] | null)?.forEach((result) => {
          const isAvailableSale =
            result.listing_type !== "sale" ||
            result.sale_status === "available";

          if (isAvailableSale && typeDetails[result.listing_type]) {
            uniqueResults.set(result.id, result);
          }
        });
      });

      setResults(Array.from(uniqueResults.values()).slice(0, 8));
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 px-4 pt-20 backdrop-blur-sm sm:pt-28"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Pesquisa global"
        className="mx-auto max-h-[75vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl"
      >
        <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <Search className="shrink-0 text-[#ffb800]" size={22} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar marca, modelo ou categoria..."
            aria-label="Pesquisar marca, modelo ou categoria"
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-zinc-600 sm:text-lg"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar pesquisa"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(75vh-81px)] overflow-y-auto p-4 sm:p-6">
          {query.trim().length < 2 ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              Escreva pelo menos 2 caracteres para pesquisar.
            </p>
          ) : loading ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              A pesquisar...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-400">
              Não foi possível pesquisar. Tente novamente.
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              Não foram encontrados resultados para “{query.trim()}”.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const details = typeDetails[result.listing_type];
                const image = [...(result.listing_images ?? [])].sort(
                  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                )[0]?.image_url;

                return (
                  <Link
                    key={result.id}
                    href={`${details.route}/${result.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-black p-3 transition hover:border-[#ffb800]/40"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:h-24 sm:w-24">
                      {image ? (
                        <img
                          src={image}
                          alt={`${result.brand ?? ""} ${result.model ?? ""}`.trim()}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-700">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[1.5px] text-[#ffb800]">
                          {details.label}
                        </span>
                        {result.category && (
                          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            {result.category}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 truncate text-base font-black text-white sm:text-lg">
                        {[result.brand, result.model].filter(Boolean).join(" ")}
                      </h2>
                      <p className="mt-2 text-sm font-black text-zinc-400 group-hover:text-[#ffb800]">
                        {formatPrice(result)}
                      </p>
                    </div>

                    <span className="pr-2 text-xl text-zinc-700 transition group-hover:translate-x-1 group-hover:text-[#ffb800]">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
