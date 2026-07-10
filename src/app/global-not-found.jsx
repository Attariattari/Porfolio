import "@/app/globals.css";
import NotFound from "./(main)/not-found";

export default function GlobalNotFound() {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NotFound />
      </body>
    </html>
  );
}
