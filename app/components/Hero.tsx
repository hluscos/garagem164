"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { optimizedImage, optimizedSrcSet } from "@/lib/images";

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
    <section className="relative h-[900px] overflow-hidden bg-black sm:h-[940px] lg:h-[760px]">

      {/* BACKGROUND */}

      <div
        className="absolute inset-0 scale-105 bg-cover bg-[position:62%_center] opacity-55 sm:bg-center lg:opacity-70"
        style={{
          backgroundImage:
            `url('${optimizedImage("/images/hero/backgrounds/garage-bg.webp", { width: 1920, quality: 68 })}')`,
        }}
      />

      {/* OVERLAYS */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black lg:bg-gradient-to-r lg:from-black lg:via-black/70 lg:to-black/15" />

      <div className="absolute right-[5%] top-[5%] w-[1200px] h-[1200px] rounded-full bg-[#ff9500]/10 blur-[180px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,140,0,0.10),transparent_45%)]" />

      {/* CONTENT */}

      <div className="relative z-10 mx-auto flex h-full max-w-[1720px] items-start px-6 py-12 sm:px-10 sm:py-16 lg:items-center lg:px-16 lg:py-0">

        {/* LEFT SIDE */}

        <div className="relative z-10 w-full lg:w-[42%]">

          <h1 className="text-[52px] font-black italic uppercase leading-[0.86] tracking-[-4px] text-white min-[380px]:text-[58px] sm:text-[76px] sm:tracking-[-6px] lg:text-[104px] lg:tracking-[-9px]">
            A TUA
            <br />
            <span className="text-[#ffb000]">
              GARAGEM.
            </span>
          </h1>

          <h2 className="mt-2 text-[52px] font-black italic uppercase leading-[0.86] tracking-[-4px] text-white min-[380px]:text-[58px] sm:text-[76px] sm:tracking-[-6px] lg:text-[104px] lg:tracking-[-9px]">
            A TUA
            <br />
            <span className="text-[#ffb000]">
              PAIXÃO.
            </span>
          </h2>

          <p className="mt-7 max-w-[540px] text-[16px] leading-[1.65] text-zinc-300 sm:text-[18px] lg:mt-8 lg:max-w-[650px] lg:text-[21px] lg:leading-[1.8]">
            O marketplace premium de miniaturas 1:64.
            Leilões exclusivos, sorteios raros e peças
            para verdadeiros colecionadores.
          </p>

          {/* BUTTONS */}

          <div className="mt-8 grid max-w-[420px] grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:gap-4 lg:mt-12 lg:flex lg:max-w-none lg:items-center lg:gap-5">

            <Link
              href="/auctions"
              className="inline-flex h-[54px] items-center justify-center rounded-2xl bg-[#ffb000] px-5 text-[13px] font-black uppercase tracking-[0.5px] text-black transition-all duration-300 hover:bg-[#ffc933] sm:px-7 lg:h-[58px] lg:px-10 lg:text-[15px]"
            >
              Ver Leilões ⚡
            </Link>

            <Link
              href="/listings"
              className="inline-flex h-[54px] items-center justify-center rounded-2xl border border-white/10 px-5 text-[13px] font-bold uppercase tracking-[0.5px] text-white transition-all duration-300 hover:border-[#ffb000] hover:bg-white/[0.04] sm:px-7 lg:h-[58px] lg:px-10 lg:text-[15px]"
            >
              Ver Anúncios
            </Link>

          </div>

          {/* TAGS */}

          <div className="mt-8 flex max-w-[440px] flex-wrap gap-2 lg:mt-16 lg:max-w-none lg:gap-3">

            <div className="h-[40px] px-4 rounded-full border border-[#ffb000]/20 bg-[#ffb000]/10 text-[#ffb000] flex items-center justify-center text-[11px] font-black uppercase tracking-[1px]">
              Anúncios Gratuitos
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

        <div className="absolute -bottom-2 -right-[28%] z-[5] h-[300px] w-[130%] sm:-right-[15%] sm:h-[360px] sm:w-[110%] lg:bottom-[20px] lg:right-[20px] lg:z-20 lg:h-[560px] lg:w-[900px]">

            <img
              key={cars[currentCar]}
              src={optimizedImage(cars[currentCar], { width: 1200, quality: 76 })}
              srcSet={optimizedSrcSet(cars[currentCar], [520, 768, 1200], 76)}
              sizes="(max-width: 640px) 130vw, (max-width: 1024px) 110vw, 900px"
              alt="Miniatura automóvel de coleção"
              width={1536}
              height={1024}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="animate-hero-car absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_80px_rgba(255,149,0,0.25)]"
            />

        </div>

      </div>

    </section>
  );
}
