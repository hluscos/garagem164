"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { ListingDeliveryMethod } from "@/lib/delivery";

type ImagePreview = {
  id: string;
  file: File;
  url: string;
  status: "loading" | "ready" | "error";
};

export default function SubmitListingPage() {
  const router = useRouter();

  const [listingType, setListingType] = useState("sale");

  const [brand, setBrand] = useState("Hot Wheels");
  const [model, setModel] = useState("");

  const [category, setCategory] = useState("Carro");
  const [condition, setCondition] = useState("Novo");

  const [description, setDescription] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<ListingDeliveryMethod>("shipping");
  const [pickupLocation, setPickupLocation] = useState("");

  const [price, setPrice] = useState("");

  const [startingBid, setStartingBid] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const [ticketPrice, setTicketPrice] = useState("1");
  const [totalTickets, setTotalTickets] = useState("99");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const imagePreviewsRef = useRef<ImagePreview[]>([]);

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  function selectImages(files: FileList) {
    imagePreviewsRef.current.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
    });

    const selectedImages = Array.from(files);
    const previews = selectedImages.map((file) => {
      const url = URL.createObjectURL(file);

      return {
        id: url,
        file,
        url,
        status: "loading" as const,
      };
    });

    imagePreviewsRef.current = previews;
    setImages(selectedImages);
    setImagePreviews(previews);
  }

  function updatePreviewStatus(
    previewId: string,
    status: ImagePreview["status"],
  ) {
    setImagePreviews((currentPreviews) => {
      const nextPreviews = currentPreviews.map((preview) =>
        preview.id === previewId ? { ...preview, status } : preview,
      );

      imagePreviewsRef.current = nextPreviews;

      return nextPreviews;
    });
  }

  function removeImage(indexToRemove: number) {
    const previewToRemove = imagePreviewsRef.current[indexToRemove];

    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
    }

    setImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToRemove),
    );

    setImagePreviews((currentPreviews) => {
      const nextPreviews = currentPreviews.filter(
        (_, index) => index !== indexToRemove,
      );

      imagePreviewsRef.current = nextPreviews;

      return nextPreviews;
    });
  }

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
            delivery_method: deliveryMethod,
            pickup_location:
              deliveryMethod === "pickup" || deliveryMethod === "both"
                ? pickupLocation
                : null,

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

        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-12 lg:py-20">

          <div className="text-[#ffb800] uppercase tracking-[3px] text-[12px] font-black">
            Garagem164
          </div>

          <h1 className="mt-5 text-[48px] font-black italic uppercase leading-[0.92] tracking-[-3px] min-[380px]:text-[52px] sm:text-[64px] lg:text-[72px] lg:leading-none lg:tracking-[-4px]">
            Vender Miniatura
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-[700px]">
            Publica a tua miniatura 1:64 para venda direta,
            leilão ou sorteio.
          </p>

        </div>

      </section>

      {/* FORM */}

      <section className="mx-auto max-w-[1200px] px-6 py-10 lg:px-12 lg:py-16">

        <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-6 sm:p-8 lg:rounded-[32px] lg:p-10">

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

          {/* ENTREGA */}

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black p-6">
            <label className="block text-sm font-bold uppercase tracking-[1px] text-zinc-300">
              Forma de entrega
            </label>

            <p className="mt-2 text-sm text-zinc-500">
              Define como o comprador irá receber a miniatura.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("shipping")}
                className={`rounded-2xl border p-5 text-left transition ${
                  deliveryMethod === "shipping"
                    ? "border-[#ffb800] bg-[#ffb800]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-black">Envio com rastreio</div>
                <div className="mt-1 text-sm text-zinc-500">
                  O código será indicado depois da venda.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={`rounded-2xl border p-5 text-left transition ${
                  deliveryMethod === "pickup"
                    ? "border-[#ffb800] bg-[#ffb800]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-black">Entrega em mão</div>
                <div className="mt-1 text-sm text-zinc-500">
                  O encontro é combinado entre vendedor e comprador.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod("both")}
                className={`rounded-2xl border p-5 text-left transition ${
                  deliveryMethod === "both"
                    ? "border-[#ffb800] bg-[#ffb800]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-black">Envio e entrega em mão</div>
                <div className="mt-1 text-sm text-zinc-500">
                  O comprador escolhe a opção no pagamento.
                </div>
              </button>
            </div>

            {(deliveryMethod === "pickup" || deliveryMethod === "both") && (
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-[1px] text-zinc-400">
                  Localidade da entrega
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(event) => setPickupLocation(event.target.value)}
                  placeholder="Ex.: Lisboa, Parque das Nações"
                  maxLength={120}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-zinc-950 p-4 outline-none transition focus:border-[#ffb800]"
                />
                <p className="mt-2 text-xs text-zinc-600">
                  Indica apenas a localidade ou zona, não uma morada privada.
                </p>
              </div>
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

                  selectImages(e.target.files);

                  e.target.value = "";
                }}
                className="hidden"
              />

            </label>

            {images.length > 0 && (
              <div className="mt-5">
                <div className="text-sm text-zinc-400">
                  {images.length} foto
                  {images.length > 1
                    ? "s"
                    : ""}{" "}
                  selecionada
                  {images.length > 1
                    ? "s"
                    : ""}. Confirma as imagens antes de publicar.
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imagePreviews.map(({ file, url, status }, index) => (
                    <div
                      key={url}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                    >
                      <div className="relative aspect-square bg-zinc-900">
                        <img
                          src={url}
                          alt={`Pré-visualização da foto ${index + 1}`}
                          onLoad={() => updatePreviewStatus(url, "ready")}
                          onError={() => updatePreviewStatus(url, "error")}
                          className={`h-full w-full object-cover transition-opacity duration-200 ${
                            status === "ready" ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        {status === "loading" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900 text-xs font-bold text-zinc-400">
                            <span className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
                            A preparar…
                          </div>
                        )}

                        {status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs font-semibold text-red-300">
                            Não foi possível mostrar esta imagem.
                          </div>
                        )}
                      </div>

                      <span className="absolute bottom-2 left-2 rounded-lg bg-black/75 px-2 py-1 text-[10px] font-black text-white">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remover a foto ${index + 1}`}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-lg text-white transition hover:bg-red-500"
                      >
                        ×
                      </button>

                      <div
                        className="truncate px-3 py-2 text-xs text-zinc-400"
                        title={file.name}
                      >
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
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
