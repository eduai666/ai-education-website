import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

type CourseFigureProps = {
  src: StaticImageData;
  alt: string;
  caption?: ReactNode;
};

export function CourseFigure({ src, alt, caption }: CourseFigureProps) {
  return (
    <figure className="course-figure">
      <Image
        className="course-figure-image"
        src={src}
        alt={alt}
        sizes="(max-width: 520px) calc(100vw - 36px), (max-width: 860px) calc(100vw - 48px), 780px"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
