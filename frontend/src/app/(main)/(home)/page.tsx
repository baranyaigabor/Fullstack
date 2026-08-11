import ExperienceSection from '@/components/home/HomeExperienceSection';
import FaqSection from '@/components/home/HomeFaqSection';
import FeatureSection from '@/components/home/HomeFeatureSection';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import { homePageMetadata } from '@/lib/metadata';
import { structuredData } from '@/lib/constants';

export const metadata = homePageMetadata;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-20 px-6 pb-10 pt-32 sm:pt-28">
        <HomeHeroSection />
        <FeatureSection />
        <ExperienceSection />
        <FaqSection />
      </div>
    </>
  );
}
