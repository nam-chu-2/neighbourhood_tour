import { lookupImage } from "../content/images.generated";
import type { Image, ImageFormat } from "../domain/types";

// Every photograph on the page goes through here, for one reason: the box has
// to be reserved before the bytes arrive. Intrinsic dimensions come from the
// generated manifest, so the page cannot shift under the reader as images load
// (research R2, SC-003).

const MIME: Record<ImageFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpeg: "image/jpeg",
};

// AVIF first, so a browser picks the smallest format it understands.
const ORDER: ImageFormat[] = ["avif", "webp", "jpeg"];

export function Figure({
  image,
  priority = false,
  sizes = "100vw",
  className,
}: {
  image: Image;
  /** The hero: loaded eagerly, at high priority. Everything else is lazy. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const entry = lookupImage(image.src);
  const fallback = entry?.variants.filter((variant) => variant.format === "jpeg") ?? [];
  const largestJpeg = fallback[fallback.length - 1];

  return (
    <figure className={className ? `figure ${className}` : "figure"}>
      <picture>
        {ORDER.map((format) => {
          const variants = entry?.variants.filter((variant) => variant.format === format) ?? [];
          if (variants.length === 0) return null;
          return (
            <source
              key={format}
              type={MIME[format]}
              sizes={sizes}
              srcSet={variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ")}
            />
          );
        })}
        <img
          src={largestJpeg?.url ?? image.src}
          alt={image.alt}
          width={entry?.width}
          height={entry?.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding={priority ? "sync" : "async"}
          style={
            image.focus && image.focus !== "centre"
              ? { objectPosition: image.focus === "top" ? "50% 20%" : "50% 80%" }
              : undefined
          }
        />
      </picture>
      <figcaption className="figure__credit">{image.credit}</figcaption>
    </figure>
  );
}
