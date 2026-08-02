import type { ComponentType } from "react";

export type LessonSection = {
  id: string;
  label: string;
};

export type LessonMeta = {
  chapter: string;
  slug: string;
  contentKind?: "markdown";
  chapterLabel: string;
  title: string;
  description: string;
  audience: string;
  readingTime: string;
  sections: LessonSection[];
};

export type LessonEntry = LessonMeta & {
  Content: ComponentType;
};

function headingId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_ -]/gu, "")
    .replace(/ /g, "-");
}

export function markdownSections(...labels: string[]): LessonSection[] {
  return labels.map((label) => ({ id: headingId(label), label }));
}
