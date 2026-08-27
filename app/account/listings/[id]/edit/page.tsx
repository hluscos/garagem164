"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ListingDeliveryMethod } from "@/lib/delivery";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [listingId, setListingId] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<ListingDeliveryMethod>("shipping");
  const [pickupLocation, setPickupLocation] = useState("");

  useEffect(() => {
    async function loadListing() {
      const { id } = await params;

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setListingId(data.id);
        setModel(data.model || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setDeliveryMethod(
          data.delivery_method === "pickup" || data.delivery_method === "both"
            ? data.delivery_method
            : "shipping",
        );
        setPickupLocation(data.pickup_location || "");
      }

      setLoading(false);
    }

    loadListing();
  }, [params]);

  async function saveChanges() {
    try {
      if (
        (deliveryMethod === "pickup" || deliveryMethod === "both") &&
        !pickupLocation.trim()
      ) {
        alert("Indica a localidade da entrega em mão.");
        return;
      }

      setSaving(true);

      const { error } = await supabase
        .from("listings")
        .update({
          model,
          description,
          price: Number(price),
          delivery_method: deliveryMethod,
          pickup_location:
            deliveryMethod === "pickup" || deliveryMethod === "both"
              ? pickupLocation.trim()
              : null,
        })
        .eq("id", listingId);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Anúncio atualizado com sucesso.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        A carregar...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-12 lg:py-16">
        <h1 className="text-[44px] font-black italic uppercase tracking-[-2px] sm:text-[56px] lg:text-[64px] lg:tracking-[-3px]">
          Editar Anúncio
        </h1>

        <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-8">
          <div>
            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
              Modelo
            </label>

            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
            />
          </div>

          <div className="mt-6">
            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
              Preço
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
            />
          </div>

          <div className="mt-6">
            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
              Forma de entrega
            </label>

            <select
              value={deliveryMethod}
              onChange={(event) =>
                setDeliveryMethod(event.target.value as ListingDeliveryMethod)
              }
              className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4"
            >
              <option value="shipping">Envio com rastreio</option>
              <option value="pickup">Entrega em mão</option>
              <option value="both">Envio e entrega em mão</option>
            </select>

            {(deliveryMethod === "pickup" || deliveryMethod === "both") && (
              <input
                type="text"
                value={pickupLocation}
                onChange={(event) => setPickupLocation(event.target.value)}
                maxLength={120}
                placeholder="Localidade ou zona de entrega"
                className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black px-4"
              />
            )}
          </div>

          <div className="mt-6">
            <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
              Descrição
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-black border border-white/10 p-4"
            />
          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="mt-8 h-[56px] px-8 rounded-2xl bg-[#ffb800] text-black font-black uppercase"
          >
            {saving ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </section>
    </main>
  );
}
