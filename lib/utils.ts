  // formatear precio
  export const formatPrecio = (valor: any, currency:string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(Number(valor));
  };
