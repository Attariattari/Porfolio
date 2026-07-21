const PROFILE_BASE_URLS = {
  linkedin: "https://www.linkedin.com/in/",
  github: "https://github.com/",
  twitter: "https://x.com/",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
};

const PROFILE_DOMAINS = {
  linkedin: ["linkedin.com", "www.linkedin.com"],
  github: ["github.com", "www.github.com"],
  twitter: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  facebook: ["facebook.com", "www.facebook.com", "fb.com", "www.fb.com"],
  instagram: ["instagram.com", "www.instagram.com"],
};

export function normalizeSocialProfileUrl(platform, value) {
  const normalizedPlatform = String(platform || "").trim().toLowerCase();
  const input = String(value || "").trim();

  if (!input || normalizedPlatform === "whatsapp") return input;

  const baseUrl = PROFILE_BASE_URLS[normalizedPlatform];
  if (!baseUrl) return input;

  if (/^https?:\/\//i.test(input)) return input;

  const withoutProtocol = input.replace(/^\/\//, "");
  const knownDomains = PROFILE_DOMAINS[normalizedPlatform] || [];
  const looksLikePlatformUrl = knownDomains.some(
    (domain) =>
      withoutProtocol.toLowerCase() === domain ||
      withoutProtocol.toLowerCase().startsWith(`${domain}/`),
  );

  if (looksLikePlatformUrl) return `https://${withoutProtocol}`;

  const username = input
    .replace(/^@+/, "")
    .replace(/^\/+/, "")
    .split(/[/?#]/, 1)[0]
    .replace(/\s+/g, "");

  return username ? `${baseUrl}${encodeURIComponent(username)}` : "";
}

