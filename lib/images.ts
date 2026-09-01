type ImageFit = "contain" | "cover" | "fill";

type OptimizedImageOptions = {
  width: number;
  height?: number;
  quality?: number;
  fit?: ImageFit;
};

export function optimizedImage(
  source: string,
  {
    width,
    height,
    quality = 75,
    fit,
  }: OptimizedImageOptions,
) {
  if (
    !source ||
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    source.startsWith("/.netlify/images") ||
    process.env.NODE_ENV === "development"
  ) {
    return source;
  }

  const params = new URLSearchParams({
    url: source,
    w: String(width),
    q: String(quality),
  });

  if (height) params.set("h", String(height));
  if (fit) params.set("fit", fit);

  return `/.netlify/images?${params.toString()}`;
}

export function optimizedSrcSet(
  source: string,
  widths: number[],
  quality = 75,
) {
  return widths
    .map(
      (width) =>
        `${optimizedImage(source, { width, quality })} ${width}w`,
    )
    .join(", ");
}
