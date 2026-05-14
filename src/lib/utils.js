/**
 * Utility functions for Muhyo Tech
 */

export const formatName = (name) => {
  if (!name) return "";
  return name
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const generateTitle = (title, isAdmin = false) => {
  const suffix = isAdmin ? "Muhyo Tech Control Center" : "Muhyo Tech";

  return `${title} - ${suffix}`;
};

/**
 * Production-ready logger that only outputs in development
 */
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args); // Errors should always be logged in production
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.info(...args);
    }
  }
};

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

