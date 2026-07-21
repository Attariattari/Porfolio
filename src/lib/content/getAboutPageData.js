import { aboutData } from "@/lib/data";

const isPlainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasContent = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== "";
};

const mergeObject = (fallback = {}, source = {}) => {
  const result = { ...fallback };

  Object.entries(source || {}).forEach(([key, value]) => {
    if (!hasContent(value)) return;

    if (Array.isArray(value)) {
      result[key] = value;
      return;
    }

    if (isPlainObject(value) && isPlainObject(fallback[key])) {
      result[key] = mergeObject(fallback[key], value);
      return;
    }

    result[key] = value;
  });

  return result;
};

export function getAboutPageData(dbData = null) {
  const merged = mergeObject(aboutData, dbData || {});
  const hero = mergeObject(aboutData.hero, merged.hero || {});
  const explicitHero = dbData?.hero || {};
  const story = mergeObject(aboutData.story, merged.story || {});
  const availability = mergeObject(aboutData.availability, merged.availability || {});

  if (!hasContent(dbData?.story?.paragraphs) && hasContent(dbData?.longDescription)) {
    story.paragraphs = String(dbData.longDescription)
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return {
    ...merged,
    hero: {
      ...hero,
      title: explicitHero.title || merged.company || hero.title || aboutData.company,
      headline: explicitHero.headline || merged.role || hero.headline || aboutData.role,
      description: explicitHero.description || merged.bio || hero.description || aboutData.bio,
      image: explicitHero.image || merged.avatar || hero.image || aboutData.avatar,
    },
    story,
    skills: mergeObject(aboutData.skills, merged.skills || {}),
    availability: {
      ...availability,
      email: availability.email || merged.email || aboutData.email,
      phone: availability.phone || merged.phone || aboutData.phone,
      location: availability.location || merged.location || aboutData.location,
      workingHours:
        availability.workingHours ||
        merged.workingHours ||
        aboutData.workingHours,
    },
    experiences:
      hasContent(merged.experiences) ? merged.experiences : aboutData.experiences,
    finalCTA: mergeObject(aboutData.finalCTA, merged.finalCTA || {}),
  };
}
