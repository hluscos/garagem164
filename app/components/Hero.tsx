"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const cars = [
    "/images/hero/cars/porsche-gt3rs.png",
    "/images/hero/cars/clio-williams.png",
    "/images/hero/cars/toyota-lemans.png",
  ];

  const [currentCar, setCurrentCar] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCar((prev) => (prev + 1) % cars.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [cars.length]);

  return (
    <section className="relative h-[760px] overflow-hidden bg-black">

      {/* BACKGROUND */}

      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 scale-105"
        style={{
          backgroundImage:
            "url('/images/hero/backgrounds/garage-bg.webp')",
        }}
      />

      {/* OVERLAYS */}

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />

      <div className="absolute right-[5%] top-[5%] w-[1200px] h-[1200px] rounded-full bg-[#ff9500]/10 blur-[180px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,140,0,0.10),transparent_45%)]" />

      {/* CONTENT */}

      <div className="relative z-10 max-w-[1720px] mx-auto px-16 h-full flex items-center">

        {/* LEFT SIDE */}

        <div className="w-[42%]">

          <h1 className="text-[104px] leading-[0.82] font-black italic uppercase tracking-[-9px] text-white">
            A TUA
            <br />
            <span className="text-[#ffb000]">
              GARAGEM.
            </span>
          </h1>

          <h2 className="mt-2 text-[104px] leading-[0.82] font-black italic uppercase tracking-[-9px] text-white">
            A TUA
            <br />
            <span className="text-[#ffb000]">
              PAIXÃO.
            </span>
          </h2>

          <p className="mt-8 max-w-[650px] text-[21px] leading-[1.8] text-zinc-300">
            O marketplace premium de miniaturas 1:64.
            Leilões exclusivos, sorteios raros e peças
            para verdadeiros colecionadores.
          </p>

          {/* BUTTONS */}

          <div className="mt-12 flex items-center gap-5">

            <a
              href="/auctions"
              className="inline-flex items-center justify-center h-[58px] px-10 rounded-2xl bg-[#ffb000] hover:bg-[#ffc933] transition-all duration-300 text-black font-black uppercase tracking-[0.5px] text-[15px]"
            >
              Ver Leilões ⚡
            </a>

            <a
              href="/listings"
              className="inline-flex items-center justify-center h-[58px] px-10 rounded-2xl border border-white/10 hover:border-[#ffb000] hover:bg-white/[0.04] transition-all duration-300 text-white font-bold uppercase tracking-[0.5px] text-[15px]"
            >
              Ver Anúncios
            </a>

          </div>

          {/* TAGS */}

          <div className="mt-16 flex flex-wrap gap-3">

            <div className="h-[40px] px-4 rounded-full border border-[#ffb000]/20 bg-[#ffb000]/10 text-[#ffb000] flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
              0% Comissão de Lançamento
            </div>

            <div className="h-[40px] px-4 rounded-full border border-[#ffb000]/20 bg-[#ffb000]/10 text-[#ffb000] flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
              Leilões
            </div>

            <div className="h-[40px] px-4 rounded-full border border-[#ffb000]/20 bg-[#ffb000]/10 text-[#ffb000] flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
              Sorteios
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="absolute right-[20px] bottom-[20px] w-[900px] h-[560px] z-20">

          <AnimatePresence mode="wait">

            <motion.img
              key={cars[currentCar]}
              src={cars[currentCar]}
              alt="Hero Car"
              initial={{
                opacity: 0,
                x: 250,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                x: -250,
                scale: 0.96,
              }}
              transition={{
                duration: 1,
              }}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_80px_rgba(255,149,0,0.25)]"
            />

          </AnimatePresence>

        </div>

      </div>

    </section>
  );
}