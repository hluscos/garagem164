"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  listing: any;
};

export default function ListingGallery({
  listing,
}: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from("listing_images")
        .select("*")
        .eq("listing_id", listing.id)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setImages(data.map((img) => img.image_url));
      }
    }

    if (listing?.id) {
      loadImages();
    }
  }, [listing]);

  if (images.length === 0) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-zinc-950 p-10 text-center">
        Sem imagens
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950">

        <img
          src={images[selectedImage]}
          alt={listing.model}
          className="w-full max-h-[650px] object-contain bg-zinc-950"
        />

        <div className="absolute top-5 left-5">
          <span className="px-4 py-2 rounded-full bg-[#ffb800] text-black text-xs font-black uppercase tracking-wider">

            {listing.listing_type === "sale" && "Venda"}

            {listing.listing_type === "auction" && "Leilão"}

            {listing.listing_type === "raffle" && "Sorteio"}

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
              alt=""
              className="aspect-square w-full object-contain bg-zinc-950"
            />
          </button>
        ))}

      </div>

      <div className="mt-5">

        <h1 className="text-4xl font-black">
          {listing.model}
        </h1>

        <p className="mt-3 text-zinc-400 text-lg">
          {listing.brand}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            {listing.condition}
          </span>

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            {listing.category}
          </span>

          <span className="px-3 py-1 rounded-full border border-white/10 text-sm">
            {listing.listing_type}
          </span>

        </div>

      </div>
    </div>
  );
}