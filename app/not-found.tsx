import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-6">La propiedad o sección que estás buscando no existe.</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        Volver al Inicio
      </Link>
    </main>
  );
}