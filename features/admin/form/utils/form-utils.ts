export function getInputClass(hasError?: boolean): string {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
    hasError
      ? 'border-red-500 bg-red-50/30 text-red-900 focus:border-red-600 ring-1 ring-red-500' // 👈 Borde rojo brillante
      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-800'
  }`;
}

export function getSelectClass(hasError?: boolean): string {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
    hasError
      ? 'border-red-500 bg-red-50/30 text-red-900 focus:border-red-600 ring-1 ring-red-500' // 👈 Borde rojo brillante
      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-800'
  }`;
}