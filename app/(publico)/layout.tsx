import { cookies, headers } from 'next/headers';
import { verifySession } from '@/lib/utils-auth';
import { Header, Footer } from "@/features/navigation";
import "../globals.css";
import 'leaflet/dist/leaflet.css';
import AdminBanner from '@/components/ui/admin-banner';
import GTMProvider from './components/GTMProvider';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  // 2. Verificamos si hay una sesión válida
  const session = token ? await verifySession(token) : null
  const isAdmin = !!session // Será true si el token es válido


  return (
    <>
      <GTMProvider isAdmin={isAdmin} />
       <AdminBanner isAdmin={isAdmin} />
      <Header isAdmin={isAdmin}/>
      <main className="grow bg-slate-50">{children}</main>
      <Footer />
    </>
  );
}
