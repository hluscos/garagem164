"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      }

      setLoading(false);
    }

    loadListing();
  }, [params]);

  async function saveChanges() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("listings")
        .update({
          model,
          description,
          price: Number(price),
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
      <section className="max-w-[1200px] mx-auto px-12 py-16">
        <h1 className="text-[64px] font-black italic uppercase tracking-[-3px]">
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