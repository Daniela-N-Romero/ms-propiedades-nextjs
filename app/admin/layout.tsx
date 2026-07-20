
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar lateral del administrador ???????? */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="font-bold text-lg mb-6">Panel Inmobiliario</h2>
        {/* Links del admin */}
      </aside>
      
      {/* Contenido principal del admin */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}