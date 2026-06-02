"use client";

import { useState } from "react";
import { mockListing } from "@/app/listing/[id]/mockListing";

export default function ListingGallery() {
  const images = mockListing.images;

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950">
        <img
          src={images[selectedImage]}
          alt={mockListing.title}
          className="w-full aspect-[16/10] object-cover hover:scale-105 transition duration-500"
        />

        <div className="absolute top-5 left-5">
          <span className="px-4 py-2 rounded-full bg-[#ffb800] text-black text-xs font-black uppercase tracking-wider">
            Leilão
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mt-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`overflow-hidden rounded-2xl border transition ${
              selectedImage === index
                ? "border-[#ffb800]"
                : "border-white/10"
            }`}
          >
            <img
              src={image}
              alt={`${mockListing.title} ${index + 1}`}
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h1 className="text-5xl font-black">
          {mockListing.title}
        </h1>

        <p className="mt-3 text-zinc-400 text-lg">
          {mockListing.brand} • Escala {mockListing.scale}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            {mockListing.condition}
          </span>

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            Caixa Original
          </span>

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            {mockListing.location}
          </span>

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            Colecionável
          </span>
        </div>
      </div>
    </div>
  );
}