// import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/utils-auth';
import "../globals.css";
import 'leaflet/dist/leaflet.css';
import AdminBanner from '@/components/ui/admin-banner';
import { GoogleTagManager } from '@next/third-parties/google';
import MetaPixel from '@/components/analytics/meta-pixel';
import NavigationWrapper from '../../features/navigation/navigation-wrapper';

export const dynamic = 'force-dynamic'

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

  // const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
   <>
      {!isAdmin && <GoogleTagManager gtmId="GTM-WMWNMF5F" />}
      {!isAdmin && <MetaPixel />}
      <AdminBanner isAdmin={isAdmin} />
      
      {/* El Wrapper (que incluye al Header/Footer) detecta el pathname en el navegador sin romper el Servidor */}
      <NavigationWrapper isAdmin={isAdmin}>
        {children}
      </NavigationWrapper>
    </>
  );
}
