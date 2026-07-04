const variants = {
  published:
    "border-accent/25 bg-accent/10 text-accent",
  uploaded:
    "border-accent/25 bg-accent/10 text-accent",
  pending:
    "border-secondary/25 bg-secondary/10 text-secondary",
  draft:
    "border-muted-foreground/20 bg-muted/40 text-muted-foreground",
  template:
    "border-border bg-muted/40 text-muted-foreground",
  featured:
    "border-accent/25 bg-accent/10 text-accent",
  standard:
    "border-border bg-muted/40 text-muted-foreground",
  error:
    "border-destructive/25 bg-destructive/10 text-destructive",
  default:
    "border-border bg-muted/40 text-muted-foreground",
};

export default function StatusBadge({ status, children, className = "" }) {
  const key = String(status || "default").toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${variants[key] || variants.default} ${className}`}
    >
      {children || status}
    </span>
  );
}
