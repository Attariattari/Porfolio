"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/data";
import {
  Linkedin,
  Github,
  Facebook,
  Twitter as XIcon,
  Globe,
} from "lucide-react";

// Professional WhatsApp Icon
const WhatsAppIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M24.504 7.504A11.88 11.88 0 0 0 16.05 4C9.465 4 4.1 9.36 4.1 15.945a11.9 11.9 0 0 0 1.594 5.973L4 28.109l6.336-1.664a11.96 11.96 0 0 0 5.71 1.457h.005c6.586 0 11.945-5.359 11.949-11.949c0-3.191-1.242-6.191-3.496-8.45zM16.05 25.883h-.004a9.93 9.93 0 0 1-5.055-1.383l-.363-.215l-3.762.985l1.004-3.665l-.234-.375a9.9 9.9 0 0 1-1.52-5.285c0-5.472 4.457-9.925 9.938-9.925a9.86 9.86 0 0 1 7.02 2.91a9.88 9.88 0 0 1 2.905 7.023c0 5.477-4.457 9.93-9.93 9.93zm5.445-7.438c-.297-.148-1.766-.87-2.039-.968c-.273-.102-.473-.149-.672.148c-.2.3-.77.973-.945 1.172c-.172.195-.348.223-.645.074c-.3-.148-1.261-.465-2.402-1.484c-.887-.79-1.488-1.77-1.66-2.067c-.176-.3-.02-.46.129-.61c.136-.132.3-.347.449-.523c.148-.171.2-.296.3-.496c.098-.199.048-.375-.027-.523c-.074-.148-.671-1.621-.921-2.219c-.243-.582-.489-.5-.672-.511c-.172-.008-.371-.008-.57-.008c-.2 0-.524.074-.798.375c-.273.297-1.043 1.02-1.043 2.488c0 1.469 1.07 2.89 1.22 3.09c.148.195 2.105 3.21 5.1 4.504a17 17 0 0 0 1.7.629c.715.226 1.367.195 1.883.12c.574-.085 1.765-.722 2.015-1.421c.247-.695.247-1.293.172-1.418c-.074-.125-.273-.2-.574-.352"
    />
  </svg>
);

const PLATFORM_CONFIG = {
  linkedin: { icon: Linkedin, color: "#0A66C2", name: "LinkedIn" },
  github: { icon: Github, color: "#ffffff", name: "GitHub" },
  twitter: { icon: XIcon, color: "#ffffff", name: "X (Twitter)" },
  facebook: { icon: Facebook, color: "#1877F2", name: "Facebook" },
  whatsapp: { icon: WhatsAppIcon, color: "#25D366", name: "WhatsApp" },
};

export default function SocialLinks({
  socials: initialSocials,
  className = "flex gap-4 items-center flex-wrap",
  iconSize = "w-5 h-5",
  buttonClassName = "w-12 h-12 rounded-xl glass border border-border/50 flex items-center justify-center transition-all duration-300",
}) {
  const [links, setLinks] = useState(initialSocials || []);
  const [loading, setLoading] = useState(!initialSocials);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/social-links");
      const result = await res.json();
      if (result.success && result.data) {
        setLinks(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch social links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSocials) {
      const initialTimer = window.setTimeout(fetchLinks, 0);

      // Polling for "real-time" sync (every 60 seconds)
      const interval = setInterval(fetchLinks, 60000);
      return () => {
        window.clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [initialSocials]);

  // If no links and not loading, show fallback if needed
  // (The API already handles fallback, but we ensure we have something)
  const displayLinks = links && links.length > 0 ? links : [];

  if (loading && !initialSocials) {
    return (
      <div className={className}>
        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={className}>
      {displayLinks.slice(0, 5).map((social, i) => {
        const platform = social.platform.toLowerCase();
        const config = PLATFORM_CONFIG[platform] || {
          icon: Globe,
          color: "#ffffff",
          name: platform,
        };
        const Icon = config.icon;

        // Strip any base tailwind hover states passed from parents
        const cleanedButtonClassName = buttonClassName.replace(
          /hover:[^\s]+/g,
          "",
        );

        return (
          <motion.a
            key={`${platform}-${i}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{
              scale: 1.1,
              y: -4,
              color: config.color,
              backgroundColor: `${config.color}1A`, // 10% opacity
              borderColor: `${config.color}80`, // 50% opacity
              boxShadow: `0 10px 25px -5px ${config.color}66`, // 40% opacity
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`relative overflow-hidden ${cleanedButtonClassName}`}
            aria-label={config.name}
            title={config.name}
          >
            <Icon className={`relative z-10 ${iconSize}`} />
          </motion.a>
        );
      })}
    </div>
  );
}
