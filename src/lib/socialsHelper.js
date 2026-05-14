/**
 * Helper to convert between different social links formats
 * Supports: Array format (static data), Object format (database), and computed URLs
 */

/**
 * Convert array of socials to object format (for DB/API)
 * Input: [{name: 'LinkedIn', icon: 'Linkedin', username: 'xxx' }]
 * Output: {linkedin: {url: '...', visible: true}, github: {url: '...', visible: true}}
 */
export const socialsArrayToObject = (socialsArray) => {
  if (!Array.isArray(socialsArray)) return {};

  const socials = {};

  socialsArray.forEach((social) => {
    const key = social.name?.toLowerCase().replace(/\s/g, "") || social.icon?.toLowerCase();

    // Handle different social link structures
    if (social.phoneNumber) {
      // WhatsApp
      socials.whatsapp = {
        phone: social.phoneNumber,
        message: social.defaultMessage || "",
        visible: true,
      };
    } else if (social.username) {
      // GitHub, LinkedIn, Twitter, Facebook, etc.
      socials[key] = {
        url: social.url || generateSocialUrl(key, social.username),
        visible: true,
      };
    } else if (social.url) {
      // Direct URL
      socials[key] = {
        url: social.url,
        visible: true,
      };
    }
  });

  // Ensure email field exists
  if (!socials.email) {
    socials.email = { visible: true };
  }

  return socials;
};

/**
 * Convert object format (DB) to array format (for UI display)
 * Input: {linkedin: {url: '...', visible: true}, github: {url: '...', visible: true}}
 * Output: [{name: 'LinkedIn', icon: 'Linkedin', url: '...', visible: true}]
 */
export const socialsObjectToArray = (socialsObject) => {
  if (typeof socialsObject !== "object" || Array.isArray(socialsObject)) return [];

  const SOCIAL_CONFIG = {
    linkedin: { name: "LinkedIn", icon: "Linkedin", color: "#0077b5" },
    github: { name: "GitHub", icon: "Github", color: "#ffffff" },
    twitter: { name: "X (Twitter)", icon: "X", color: "#ffffff" },
    facebook: { name: "Facebook", icon: "Facebook", color: "#1877f2" },
    instagram: { name: "Instagram", icon: "Instagram", color: "#E4405F" },
    youtube: { name: "YouTube", icon: "Youtube", color: "#FF0000" },
    devto: { name: "Dev.to", icon: "Code2", color: "#000000" },
    portfolio: { name: "Portfolio", icon: "Globe", color: "#4c51bf" },
    blog: { name: "Blog", icon: "FileText", color: "#4c51bf" },
    codepen: { name: "CodePen", icon: "Code2", color: "#000000" },
    dribbble: { name: "Dribbble", icon: "Sparkles", color: "#EA4C89" },
    behance: { name: "Behance", icon: "Sparkles", color: "#1473E6" },
    whatsapp: { name: "WhatsApp", icon: "WhatsApp", color: "#25D366" },
    telegram: { name: "Telegram", icon: "Send", color: "#0088cc" },
    discord: { name: "Discord", icon: "Send", color: "#5865F2" },
    email: { name: "Email", icon: "Mail", color: "#666666" },
  };

  const result = [];

  Object.entries(socialsObject).forEach(([key, social]) => {
    const config = SOCIAL_CONFIG[key];
    if (!config) return;

    // Skip if not visible
    if (social.visible === false) return;

    // Handle WhatsApp differently
    if (key === "whatsapp" && social.phone) {
      result.push({
        name: config.name,
        icon: config.icon,
        phoneNumber: social.phone,
        defaultMessage: social.message || "",
        color: config.color,
        url: `https://wa.me/${social.phone}?text=${encodeURIComponent(social.message || "")}`,
      });
    } else if (social.url) {
      result.push({
        name: config.name,
        icon: config.icon,
        url: social.url,
        color: config.color,
      });
    } else if (key === "email") {
      // Email doesn't need URL in this format
      result.push({
        name: config.name,
        icon: config.icon,
        color: config.color,
      });
    }
  });

  return result;
};

/**
 * Generate full social URL from username and platform
 */
function generateSocialUrl(platform, username) {
  const urls = {
    github: `https://github.com/${username}`,
    linkedin: `https://www.linkedin.com/in/${username}`,
    twitter: `https://x.com/${username}`,
    facebook: `https://www.facebook.com/${username}`,
    instagram: `https://instagram.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    devto: `https://dev.to/${username}`,
    codepen: `https://codepen.io/${username}`,
    dribbble: `https://dribbble.com/${username}`,
    behance: `https://behance.net/${username}`,
    telegram: `https://t.me/${username}`,
  };

  return urls[platform] || "#";
}

/**
 * Merge static socials (from SOCIAL_LINKS) with DB socials
 * Ensures consistency between different data sources
 */
export const mergeSocials = (dbSocials, staticSocials) => {
  if (!dbSocials || Object.keys(dbSocials).length === 0) {
    // If no DB data, use static (converted to object format)
    return Array.isArray(staticSocials)
      ? socialsArrayToObject(staticSocials)
      : staticSocials;
  }

  // Use DB data as primary source
  return dbSocials;
};

/**
 * Validate socials object matches schema requirements
 */
export const validateSocials = (socials) => {
  if (Array.isArray(socials)) {
    console.warn("⚠️ Socials is array format, converting to object format");
    return socialsArrayToObject(socials);
  }

  if (typeof socials !== "object" || socials === null) {
    return {};
  }

  // Ensure each social has proper structure
  const validated = {};
  Object.entries(socials).forEach(([key, value]) => {
    if (key === "whatsapp") {
      validated[key] = {
        phone: value.phone || "",
        message: value.message || "",
        visible: value.visible !== false,
      };
    } else if (key === "email") {
      validated[key] = {
        visible: value.visible !== false,
      };
    } else {
      validated[key] = {
        url: value.url || "",
        username: value.username,
        visible: value.visible !== false,
      };
    }
  });

  return validated;
};
