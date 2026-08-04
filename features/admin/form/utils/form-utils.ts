export const getInputClass = (hasError: boolean) =>
  `mt-1 w-full p-2.5 text-sm rounded-lg border transition-all ${
    hasError
      ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500 font-medium'
      : 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange'
  }`;

export const getSelectClass = getInputClass;

