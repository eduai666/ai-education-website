import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

type CourseFigureProps = {
  src: StaticImageData;
  alt: string;
  caption?: ReactNode;
  preload?: boolean;
};

export function CourseFigure({ src, alt, caption, preload = false }: CourseFigureProps) {
  return (
    <figure className="course-figure">
      <Image
        className="course-figure-image"
        src={src}
        alt={alt}
        preload={preload}
        sizes="(max-width: 520px) calc(100vw - 36px), (max-width: 860px) calc(100vw - 48px), 780px"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
      <a
        className="course-figure-open"
        href={src.src}
        target="_blank"
        rel="noreferrer"
      >
        查看大图
        <span aria-hidden="true">↗</span>
      </a>
    </figure>
  );
}
