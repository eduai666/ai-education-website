export type SiteSearchSection = {
  id: string;
  label: string;
};

export type SiteSearchDocument = {
  path: string;
  title: string;
  description: string;
  sectionLabel: string;
  sections: SiteSearchSection[];
};
