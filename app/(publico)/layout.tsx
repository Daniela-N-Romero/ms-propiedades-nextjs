import { getContactLinks } from '@/backend/services/config.service';
import { Header, Footer } from "@/features/navigation";

import "../globals.css";
import 'leaflet/dist/leaflet.css';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const links = await getContactLinks();

  return (
        <>
            <Header />
            <main className="grow bg-slate-50">{children}</main>
            <Footer />
        </>
  );
}
