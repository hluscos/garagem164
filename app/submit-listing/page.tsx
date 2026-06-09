"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function SubmitListingPage() {
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

async function handleSubmit() {
  try {
    setLoading(true);
    setMessage("");

    const payload = {
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
    };

    console.log("PAYLOAD:", payload);

    const result = await supabase
  .from("listings")
  .insert([payload]);

console.log("SUPABASE RESULT:", result);

if (result.error) {
  console.log("ERROR FULL:", result.error);
  console.log("ERROR MESSAGE:", result.error.message);
  console.log("ERROR DETAILS:", result.error.details);

  setMessage(result.error.message);
  return;
}

    setMessage("Anúncio criado com sucesso.");
  } catch (error) {
    console.error(error);
    setMessage("Erro inesperado.");
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

      <div className="grid grid-cols-2 gap-8">

        {/* MARCA */}

        <div>

          <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
            Marca
          </label>

          <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
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

          <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
            Modelo
          </label>

          <input
  type="text"
  value={model}
  onChange={(e) => setModel(e.target.value)}
  placeholder="Ex: Ferrari F40"
  className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
/>

        </div>

        {/* CATEGORIA */}

        <div>

          <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
            Categoria
          </label>

          <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
            <option>Carro</option>
            <option>Camião</option>
            <option>Carrinha</option>
            <option>Motociclo</option>
            <option>Transportador</option>
          </select>

        </div>

        {/* ESTADO */}

        <div>

          <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
            Estado
          </label>

          <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
            <option>Novo</option>
            <option>Como Novo</option>
            <option>Usado</option>
          </select>

        </div>

        {/* TIPO */}

        <div>

          <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
            Tipo de Anúncio
          </label>

          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
          >
            <option value="sale">Venda Direta</option>
            <option value="auction">Leilão</option>
            <option value="raffle">Sorteio</option>
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
  onChange={(e) => setPrice(e.target.value)}
  placeholder="0.00"
  className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
/>

          </div>

        )}

        {/* AUCTION */}

        {listingType === "auction" && (

          <>
            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
                Licitação Inicial
              </label>

              <input
                type="number"
                placeholder="0.00"
                className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4"
              />

            </div>

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
                Duração
              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
                <option>3 dias</option>
                <option>5 dias</option>
                <option>7 dias</option>
                <option>10 dias</option>
              </select>

            </div>
          </>

        )}

        {/* RAFFLE */}

        {listingType === "raffle" && (

          <>
            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
                Preço por Ticket
              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
                <option>0.25€</option>
                <option>0.50€</option>
                <option>1€</option>
                <option>2€</option>
              </select>

            </div>

            <div>

              <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
                Número de Tickets
              </label>

              <select className="w-full h-14 rounded-2xl bg-black border border-white/10 px-4">
                <option>25</option>
                <option>50</option>
                <option>75</option>
                <option>99</option>
              </select>

            </div>
          </>

        )}

      </div>

      {/* DESCRIÇÃO */}

      <div className="mt-8">

        <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
          Descrição
        </label>

        <textarea
  rows={6}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full rounded-2xl bg-black border border-white/10 p-4"
  placeholder="Descreve a miniatura..."
/>

      </div>

      {/* FOTOS */}

      <div className="mt-8">

        <label className="block mb-3 text-sm font-bold uppercase text-zinc-400">
          Fotos
        </label>

        <input
          type="file"
          multiple
          className="w-full rounded-2xl bg-black border border-white/10 p-4"
        />

      </div>

           {/* BUTTON */}

      <button
        onClick={handleSubmit}
        className="mt-10 h-[60px] px-10 rounded-2xl bg-[#ffb800] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[1px]"
      >
        {loading ? "A publicar..." : "Publicar Miniatura"}
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
