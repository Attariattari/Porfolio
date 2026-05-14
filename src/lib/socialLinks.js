/**
 * Social Links Management Utility
 * 
 * This module provides centralized access to social media links.
 * Import and use these functions across the application to ensure
 * consistency and easy updates.
 * 
 * Usage:
 * - getSocialLink('linkedin') -> Get a specific social link
 * - getAllSocialLinks() -> Get all social links as an array
 * - getSocialLinksByNames(['linkedin', 'github']) -> Get specific links
 */

import { SOCIAL_LINKS, SOCIAL_LINKS_ARRAY } from '@/lib/data';

/**
 * Get a specific social link by key
 * @param {string} key - The social link key (linkedin, github, twitter, etc.)
 * @returns {object} Social link object or null if not found
 */
export const getSocialLink = (key) => {
    return SOCIAL_LINKS[key.toLowerCase()] || null;
};

/**
 * Get all social links as an array
 * @returns {array} Array of all social links
 */
export const getAllSocialLinks = () => {
    return SOCIAL_LINKS_ARRAY;
};

/**
 * Get specific social links by names
 * @param {array} names - Array of social link keys to retrieve
 * @returns {array} Filtered array of social links
 */
export const getSocialLinksByNames = (names = []) => {
    if (!Array.isArray(names) || names.length === 0) {
        return SOCIAL_LINKS_ARRAY;
    }
    return names
        .map(name => getSocialLink(name))
        .filter(link => link !== null);
};

/**
 * Get social link URL by key
 * @param {string} key - The social link key
 * @returns {string} The URL or empty string if not found
 */
export const getSocialLinkUrl = (key) => {
    const link = getSocialLink(key);
    return link?.url || '';
};

/**
 * Get all social links as URL map
 * @returns {object} Object with social keys mapped to URLs
 */
export const getSocialLinksMap = () => {
    const map = {};
    Object.entries(SOCIAL_LINKS).forEach(([key, link]) => {
        map[key] = link.url;
    });
    return map;
};

/**
 * Get social links for a specific form (e.g., admin settings)
 * Extracts editable fields (username, phoneNumber, message) from each social link
 * @returns {object} Social links formatted for form fields
 */
export const getSocialLinksForForm = () => {
    return {
        linkedin_username: SOCIAL_LINKS.linkedin.username,
        github_username: SOCIAL_LINKS.github.username,
        twitter_username: SOCIAL_LINKS.twitter.username,
        facebook_username: SOCIAL_LINKS.facebook.username,
        whatsapp_phone: SOCIAL_LINKS.whatsapp.phoneNumber,
        whatsapp_message: SOCIAL_LINKS.whatsapp.defaultMessage,
    };
};

/**
 * Get social link config by key
 * Includes both URL and editable fields
 * @param {string} key - Social link key
 * @returns {object} Full social link configuration
 */
export const getSocialLinkConfig = (key) => {
    const link = SOCIAL_LINKS[key.toLowerCase()];
    return link ? {
        name: link.name,
        icon: link.icon,
        url: link.url, // Auto-generated from editable fields
        color: link.color,
        // Include editable field (varies by social)
        username: link.username,
        phoneNumber: link.phoneNumber,
        defaultMessage: link.defaultMessage,
    } : null;
};

/**
 * Build URL from username (for social platforms)
 * @param {string} platform - Platform name (linkedin, github, twitter, facebook)
 * @param {string} username - Username on that platform
 * @returns {string} Complete URL
 */
export const buildSocialUrl = (platform, username) => {
    const urls = {
        linkedin: (u) => `https://www.linkedin.com/in/${u}`,
        github: (u) => `https://github.com/${u}`,
        twitter: (u) => `https://x.com/${u}`,
        facebook: (u) => `https://www.facebook.com/${u}`,
    };
    const builder = urls[platform.toLowerCase()];
    return builder ? builder(username) : '';
};

/**
 * Update social username (for LinkedIn, GitHub, Twitter, Facebook)
 * @param {string} platform - Platform name
 * @param {string} username - New username
 */
export const updateSocialUsername = (platform, username) => {
    const link = SOCIAL_LINKS[platform.toLowerCase()];
    if (link && link.username !== undefined) {
        link.username = username;
    }
};

/**
 * Get WhatsApp specific configuration
 * @returns {object} WhatsApp phone and message separately
 */
export const getWhatsAppConfig = () => {
    const wa = SOCIAL_LINKS.whatsapp;
    return {
        phoneNumber: wa.phoneNumber,
        message: wa.defaultMessage,
        url: wa.url,
    };
};

/**
 * Build WhatsApp URL from phone and message
 * @param {string} phoneNumber - WhatsApp phone number (with country code)
 * @param {string} message - Pre-filled message
 * @returns {string} Complete WhatsApp URL
 */
export const buildWhatsAppUrl = (phoneNumber, message) => {
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Update WhatsApp configuration
 * @param {object} config - Object with phoneNumber and/or message properties
 */
export const updateWhatsAppConfig = (config) => {
    if (config.phoneNumber) {
        SOCIAL_LINKS.whatsapp.phoneNumber = config.phoneNumber;
    }
    if (config.message) {
        SOCIAL_LINKS.whatsapp.defaultMessage = config.message;
    }
    // URL will auto-update via getter
};

/**
 * Get social link by icon type
 * @param {string} iconType - The icon type
 * @returns {object} Social link object or null
 */
export const getSocialLinkByIcon = (iconType) => {
    return Object.values(SOCIAL_LINKS).find(
        link => link.icon === iconType
    ) || null;
};

/**
 * Update a social link (useful for dynamic updates)
 * Note: This only updates the runtime object, not the source data
 * For persistent updates, modify the SOCIAL_LINKS in data.js
 * 
 * @param {string} key - The social link key
 * @param {object} updates - Object with properties to update
 */
export const updateSocialLink = (key, updates) => {
    const link = getSocialLink(key);
    if (link) {
        Object.assign(link, updates);
    }
};

export default {
    getSocialLink,
    getAllSocialLinks,
    getSocialLinksByNames,
    getSocialLinkUrl,
    getSocialLinksMap,
    getSocialLinksForForm,
    getSocialLinkByIcon,
    updateSocialLink,
    getWhatsAppConfig,
    buildWhatsAppUrl,
    updateWhatsAppConfig,
};
