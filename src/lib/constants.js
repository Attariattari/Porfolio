export const THEME_COLORS = {
  primary: "#00b4d8",
  secondary: "#0077b6",
  accent: "#90e0ef",
  background: "#03045e",
  text: "#caf0f8",
};

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "About", href: "/about" },
  { name: "Goals", href: "/goals" },
  { name: "Blog", href: "/blog" },
  { name: "Resume", href: "/resume" },
  { name: "Skills", href: "/skills" },
  { name: "Contact", href: "/contact" },
];

export const ADMIN_NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { name: "Bookings", href: "/admin/bookings", icon: "Activity" },
  { name: "Messages", href: "/admin/messages", icon: "MessageSquare" },
  { name: "Hero", href: "/admin/hero", icon: "Zap" },
  { name: "About", href: "/admin/about", icon: "User" },
  { name: "Services", href: "/admin/services", icon: "Cpu" },
  { name: "Projects", href: "/admin/projects", icon: "Briefcase" },
  { name: "Skills", href: "/admin/skills", icon: "Code2" },
  { name: "Goals", href: "/admin/goals", icon: "Target" },
  { name: "Blog", href: "/admin/blogs", icon: "FileText" },
  { name: "Resume", href: "/admin/resume", icon: "FileText" },
  { name: "Subscribers", href: "/admin/subscribers", icon: "Users" },
  { name: "Social Links", href: "/admin/social-links", icon: "MessageSquare" },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: "Bell",
    role: "super-admin",
  },
  { name: "Users", href: "/admin/users", icon: "Users", role: "super-admin" },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "Settings",
    role: "super-admin",
  },
];
export const SERVICE_OPTIONS = [
  { value: "web-development", label: "Web Development" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "api-development", label: "API & Backend" },
  { value: "mobile-app-development", label: "Mobile Apps" },
  { value: "cloud-devops", label: "Cloud & DevOps" },
  { value: "seo-optimization", label: "SEO Optimization" },
  { value: "other", label: "Other" },
];

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "seen", label: "Seen" },
  { value: "replied", label: "Replied" },
];

export const BOOKING_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "seen", label: "Seen" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];
