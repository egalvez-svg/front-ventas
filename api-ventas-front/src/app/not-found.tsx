export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-950 text-stone-900 dark:text-slate-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-stone-300 dark:text-slate-700">404</h1>
      <p className="text-stone-400 dark:text-slate-400">Página no encontrada</p>
      <a href="/" className="text-amber-500 hover:text-amber-400 text-sm transition-colors">
        Volver al inicio
      </a>
    </div>
  );
}
