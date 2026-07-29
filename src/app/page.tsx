import { SiteContentPage } from "@/components/content/site-content-page";
import { projectIntroductionPage } from "@/server/content/site-pages";

export default function Home() {
  return <SiteContentPage page={projectIntroductionPage} />;
}
