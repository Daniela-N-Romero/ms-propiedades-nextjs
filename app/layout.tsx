import { getContactLinks } from '@/backend/services/config.service';
import { ConfigProvider } from '@/providers/config-provider';
import NextTopLoader from 'nextjs-toploader';
import type { Metadata } from "next";
import { Montserrat, League_Spartan } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-spartan",
});

export const metadata: Metadata = {
  title: "MS Propiedades Industrial",
  description: "Inmobliaria especializada en inmuebles industriales y comerciales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const links = await getContactLinks();

  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${leagueSpartan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConfigProvider links={links}>
          <NextTopLoader
          color="#f97316" // Tu color naranja de marca (brand-orange)
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
