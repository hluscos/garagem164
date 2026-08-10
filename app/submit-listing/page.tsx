"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SubmitListingPage() {
  const router = useRouter();

  const [listingType, setListingType] = useState("sale");

  const [brand, setBrand] = useState("Hot Wheels");
  const [model, setModel] = useState("");

  const [category, setCategory] = useState("Carro");
  const [condition, setCondition] = useState("Novo");

  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [startingBid, setStartingBid] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const [ticketPrice, setTicketPrice] = useState("1");
  const [totalTickets, setTotalTickets] = useState("99");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      }
    }

    void checkAuth();
  }, [router]);

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      /*
       * ---------------------------------------------------------
       * 1. OBTER SESSÃO
       * ---------------------------------------------------------
       */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(
          "A tua sessão terminou. Faz login novamente.",
        );

        router.push("/login");
        return;
      }

      /*
       * ---------------------------------------------------------
       * 2. CRIAR ANÚNCIO ATRAVÉS DA API
       * ---------------------------------------------------------
       *
       * O user_id NÃO é enviado.
       *
       * A API obtém o user.id diretamente do access token.
       */

      const response = await fetch(
        "/api/create-listing",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            brand,
            model,
            category,
            condition,
            listing_type: listingType,
            description,

            price:
              listingType === "sale"
                ? Number(price)
                : null,

            starting_bid:
              listingType === "auction"
                ? Number(startingBid)
                : null,

            duration_days:
              listingType === "auction"
                ? Number(durationDays)
                : null,

            ticket_price:
              listingType === "raffle"
                ? Number(ticketPrice)
                : null,

            total_tickets:
              listingType === "raffle"
                ? Number(totalTickets)
                : null,
          }),
        },
      );

      const result = await response.json();

      console.log(
        "CREATE LISTING RESPONSE:",
        result,
      );

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
            "Não foi possível criar o anúncio.",
        );

        return;
      }

      const listing = result.listing;

      if (!listing?.id) {
        setMessage(
          "O anúncio foi criado mas não foi devolvido um ID válido.",
        );

        return;
      }

      /*
       * ---------------------------------------------------------
       * 3. UPLOAD DAS IMAGENS
       * ---------------------------------------------------------
       */

      const uploadedImages: string[] = [];

      for (const file of images) {
        const fileName =
          `${Date.now()}-${Math.random()}-${file.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("listing-images")
            .upload(fileName, file);

        if (uploadError) {
          console.error(
            "UPLOAD ERROR:",
            uploadError,
          );

          setMessage(
            `Erro upload: ${uploadError.message}`,
          );

          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        uploadedImages.push(publicUrl);
      }

      /*
       * ---------------------------------------------------------
       * 4. GRAVAR IMAGENS NA BD
       * ---------------------------------------------------------
       */

      for (
        let i = 0;
        i < uploadedImages.length;
        i++
      ) {
        const { error: imageError } =
          await supabase
            .from("listing_images")
            .insert({
              listing_id: listing.id,
              image_url: uploadedImages[i],
              sort_order: i + 1,
            });

        if (imageError) {
          console.error(
            "IMAGE INSERT ERROR:",
            JSON.stringify(
              imageError,
              null,
              2,
            ),
          );

          setMessage(
            `Anúncio criado, mas houve um erro ao guardar uma das imagens: ${imageError.message}`,
          );

          return;
        }
      }

      /*
       * ---------------------------------------------------------
       * 5. SUCESSO
       * ---------------------------------------------------------
       */

      setMessage(
        `Anúncio criado com sucesso. (${uploadedImages.length} fotos)`,
      );

      setTimeout(() => {
        router.push(
          `/listing/${listing.id}`,
        );
      }, 1000);
    } catch (error) {
      console.error(
        "CREATE LISTING ERROR:",
        error,
      );

      setMessage(
        "Erro inesperado ao criar o anúncio.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="border-b border-white/5">

        <div className="max-w-[1200px] mx-auto px-12 py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Garagem164
          </div>

          <h1 className="mt-5 text-[72px] leading-none font-black italic uppercase tracking-[-4px]">
            Vender Miniatura
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Publica a tua miniatura 1:64 para venda direta,
            leilão ou sorteio.
          </p>

        </div>

      </section>

      {/* FORM */}

      <section className="max-w-[1200px] mx-auto px-12 py-16">

        <div className="rounded-[32px] border border-white/5 bg-zinc-950 p-10">

          <div className="grid md:grid-cols-2 gap-8">

            {/* MARCA */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                Marca
              </label>

              <select
                value={brand}
                onChange={(e) =>
                  setBrand(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              >
                <option>Hot Wheels</option>
                <option>Mini GT</option>
                <option>Inno64</option>
                <option>Tarmac Works</option>
                <option>Matchbox</option>
                <option>Pop Race</option>
                <option>Greenlight</option>
                <option>Johnny Lightning</option>
                <option>Kaido House</option>
                <option>M2 Machines</option>
                <option>Auto World</option>
                <option>Outro</option>
              </select>

            </div>

            {/* MODELO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                Modelo
              </label>

              <input
                type="text"
                value={model}
                onChange={(e) =>
                  setModel(e.target.value)
                }
                placeholder="Ex: Ferrari F40"
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              />

            </div>

            {/* CATEGORIA */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                Categoria
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              >
                <option>Carro</option>
                <option>Camião</option>
                <option>Carrinha</option>
                <option>Motociclo</option>
                <option>Transportador</option>
              </select>

            </div>

            {/* ESTADO */}

            <div>

              <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                Estado
              </label>

              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              >
                <option>Novo</option>
                <option>Como Novo</option>
                <option>Usado</option>
              </select>

            </div>

            {/* TIPO */}

            <div className="col-span-2">

              <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                Tipo de Anúncio
              </label>

              <select
                value={listingType}
                onChange={(e) =>
                  setListingType(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              >
                <option value="sale">
                  Venda Direta
                </option>

                <option value="auction">
                  Leilão
                </option>

                <option value="raffle">
                  Sorteio
                </option>
              </select>

            </div>

            {/* SALE */}

            {listingType === "sale" && (

              <div>

                <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
                  Preço
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="0.00"
                  className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
                />

              </div>

            )}

            {/* AUCTION */}

            {listingType === "auction" && (

              <>

                <div>

                  <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                    Licitação Inicial
                  </label>

                  <input
                    type="number"
                    value={startingBid}
                    onChange={(e) =>
                      setStartingBid(
                        e.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
                  />

                </div>

                <div>

                  <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                    Duração
                  </label>

                  <select
                    value={durationDays}
                    onChange={(e) =>
                      setDurationDays(
                        e.target.value,
                      )
                    }
                    className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
                  >
                    <option value="3">
                      3 dias
                    </option>

                    <option value="5">
                      5 dias
                    </option>

                    <option value="7">
                      7 dias
                    </option>

                    <option value="10">
                      10 dias
                    </option>
                  </select>

                </div>

              </>

            )}

            {/* RAFFLE */}

            {listingType === "raffle" && (

              <>

                <div>

                  <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                    Preço por Ticket
                  </label>

                  <select
                    value={ticketPrice}
                    onChange={(e) =>
                      setTicketPrice(
                        e.target.value,
                      )
                    }
                    className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
                  >
                    <option value="0.25">
                      0.25€
                    </option>

                    <option value="0.50">
                      0.50€
                    </option>

                    <option value="1">
                      1€
                    </option>

                    <option value="2">
                      2€
                    </option>
                  </select>

                </div>

                <div>

                  <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
                    Número de Tickets
                  </label>

                  <select
                    value={totalTickets}
                    onChange={(e) =>
                      setTotalTickets(
                        e.target.value,
                      )
                    }
                    className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
                  >
                    <option value="25">
                      25
                    </option>

                    <option value="50">
                      50
                    </option>

                    <option value="75">
                      75
                    </option>

                    <option value="99">
                      99
                    </option>
                  </select>

                </div>

              </>

            )}

          </div>

          {/* DESCRIÇÃO */}

          <div className="mt-8">

            <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
              Descrição
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              className="w-full rounded-2xl bg-black border border-white/10 p-4"
              placeholder="Descreve a miniatura..."
            />

          </div>

          {/* FOTOS */}

          <div className="mt-8">

            <label className="block mb-3 text-sm font-bold uppercase tracking-[1px] text-zinc-300">
              Fotos
            </label>

            <label className="flex flex-col items-center justify-center gap-3 h-[180px] rounded-[24px] border-2 border-dashed border-white/10 bg-black hover:border-[#ffb800]/50 cursor-pointer transition-all duration-300">

              <div className="text-5xl">
                📷
              </div>

              <div className="text-lg font-bold">
                Arrasta fotos para aqui
              </div>

              <div className="text-zinc-500 text-sm">
                ou clica para selecionar
              </div>

              <div className="px-5 py-2 rounded-xl bg-[#ffb800] text-black font-bold text-sm">
                Selecionar Fotos
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (!e.target.files) {
                    return;
                  }

                  setImages(
                    Array.from(
                      e.target.files,
                    ),
                  );
                }}
                className="hidden"
              />

            </label>

            {images.length > 0 && (
              <div className="mt-4 text-sm text-zinc-400">
                {images.length} foto
                {images.length > 1
                  ? "s"
                  : ""}{" "}
                selecionada
                {images.length > 1
                  ? "s"
                  : ""}
              </div>
            )}

          </div>

          {/* BUTTON */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-10 h-[60px] px-10 rounded-2xl transition-all duration-300 text-black font-black uppercase tracking-[1px] ${
              loading
                ? "cursor-not-allowed bg-zinc-600"
                : "bg-[#ffb800] hover:bg-[#ffc933]"
            }`}
          >
            {loading
              ? "A publicar..."
              : "Publicar Miniatura"}
          </button>

          {message && (
            <div className="mt-4 text-zinc-300">
              {message}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}