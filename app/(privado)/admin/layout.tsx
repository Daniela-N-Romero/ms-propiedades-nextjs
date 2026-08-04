import "../../globals.css";
import 'leaflet/dist/leaflet.css';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
