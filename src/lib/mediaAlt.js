const BRAND_NAME = "Muhyo Tech";

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

export function ensureMuhyoTechAlt(altText, fallbackDescription = "website image") {
  const description = clean(altText) || clean(fallbackDescription) || "website image";
  return /muhyo tech/i.test(description)
    ? description
    : `${BRAND_NAME} — ${description}`;
}

export function getHeroMediaAlt(hero = {}) {
  return ensureMuhyoTechAlt(
    hero.visualImageAlt || hero.imageAlt,
    "full-stack web development and software engineering visual",
  );
}

export function getAboutMediaAlt(about = {}) {
  return ensureMuhyoTechAlt(
    about.hero?.imageAlt || about.avatarAlt,
    `professional portrait of ${clean(about.name) || "the founder"}`,
  );
}

export function getServiceMediaAlt(service = {}) {
  return ensureMuhyoTechAlt(
    service.heroImageAlt || service.imageAlt,
    `${clean(service.title) || "web development"} service visual`,
  );
}

export function getProjectMediaAlt(project = {}, variant = "thumbnail", index = 0) {
  const title = clean(project.title) || "software project";
  const galleryAlt = Array.isArray(project.galleryImageAlts)
    ? project.galleryImageAlts[index]
    : "";
  const storedAlt =
    variant === "hero"
      ? project.heroImageAlt || project.thumbnailAlt || project.imageAlt
      : variant === "gallery"
        ? galleryAlt || project.thumbnailAlt || project.imageAlt
        : project.thumbnailAlt || project.imageAlt || project.heroImageAlt;
  const description =
    variant === "hero"
      ? `hero screenshot of the ${title} project`
      : variant === "gallery"
        ? `${title} project screenshot ${index + 1}`
        : `project preview for ${title}`;

  return ensureMuhyoTechAlt(storedAlt, description);
}
