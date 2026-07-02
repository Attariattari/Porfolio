import { Montserrat } from "next/font/google";
import Providers from "./Providers";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Muhyo Tech Control Center",
    template: "%s - Muhyo Tech Control Center",
  },
  description: "Secure dashboard for managing Muhyo Tech content.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className={`${montserrat.className} bg-background transition-colors min-h-screen text-foreground`}>
      <Providers>
        {children}
      </Providers>
    </div>
  );
}
