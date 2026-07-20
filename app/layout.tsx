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
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${leagueSpartan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
            <Header />
            <main className="grow bg-slate-50">{children}</main>
            <Footer />
      </body>
    </html>
  );
}
