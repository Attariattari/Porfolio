export const HOME_SEO_TITLE =
  "Muhyo Tech | Full-Stack Web Developer in Lahore, Pakistan";

export const HOME_SEO_DESCRIPTION =
  "Muhyo Tech builds fast websites, full-stack web apps, admin dashboards, and scalable Next.js and MERN solutions for businesses in Lahore and beyond.";

export const HOME_SEO_LIMITS = {
  title: { min: 50, max: 60 },
  description: { min: 120, max: 160 },
};

function isWithinRange(value, limits) {
  const length = String(value || "").trim().length;
  return length >= limits.min && length <= limits.max;
}

export function resolveHomeSeo(seo = {}) {
  const configuredTitle = String(seo?.title || "").trim();
  const configuredDescription = String(seo?.description || "").trim();

  return {
    title: isWithinRange(configuredTitle, HOME_SEO_LIMITS.title)
      ? configuredTitle
      : HOME_SEO_TITLE,
    description: isWithinRange(
      configuredDescription,
      HOME_SEO_LIMITS.description,
    )
      ? configuredDescription
      : HOME_SEO_DESCRIPTION,
  };
}
