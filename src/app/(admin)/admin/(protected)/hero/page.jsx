import { HeroController } from "@/controllers/HeroController";
import { serializeDoc } from "@/lib/mongooseHelper";
import HeroForm from "./HeroForm";
import { portfolioData } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function AdminHeroPage() {
    const dbHero = await HeroController.get();
    const heroData = dbHero ? serializeDoc(dbHero) : null;
    const staticHero = portfolioData.siteConfig.hero;

    return (
        <div>
            <HeroForm initialData={heroData} staticFallback={staticHero} />
        </div>
    );
}
