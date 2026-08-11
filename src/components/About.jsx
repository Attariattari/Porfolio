import { portfolioData } from "@/lib/data";
import { getAboutPageData } from "@/lib/content/getAboutPageData";
import AboutContent from "./AboutContent";

export default function About({ data: initialData = null, isHomePage = false }) {
  const data = getAboutPageData(initialData || portfolioData.about);

  if (!data) return null;

  return <AboutContent data={data} isHomePage={isHomePage} />;
}
