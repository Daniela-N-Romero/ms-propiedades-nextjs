import { GoogleAnalytics } from '@next/third-parties/google';
import MetaPixel from '@/components/analytics/meta-pixel';
import type { Metadata } from "next";
import { Header, Footer } from "@/features/navigation";
import { Montserrat, League_Spartan } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-spartan",
});

export const metadata: Metadata = {
  title: "MS Propiedades",
  description: "Inmobliaria especializada en inmuebles industriales y comerciales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${leagueSpartan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
            <Header />
            <main className="grow bg-slate-50">{children}</main>
            <Footer />
            {/* Analytics sin impactar la velocidad de carga de la página */}
            <MetaPixel />
            {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
