// Cálculo de seña/saldo compartido entre Cobros, Agenda y Limpiezas.
// Estaba repetido en los tres archivos y así fue como un bug de redondeo
// se arregló en uno y se quedó sin arreglar en los otros dos.
export function calcularSaldoPendiente(pagos, totalPrice) {
  const sena = pagos?.find(p => p.type === "seña");
  const saldoExistente = pagos?.find(p => p.type === "saldo");
  // Total menos la seña real, no la mitad exacta: con precios especiales
  // impares la mitad exacta desviaba $1 (ej: total 55.555 → seña 27.778 +
  // saldo "mitad" 27.778 = 55.556, un peso de más).
  const monto = Math.round(parseFloat(totalPrice || 0) - parseFloat(sena?.amount || 0));
  return { sena, saldoExistente, monto };
}
