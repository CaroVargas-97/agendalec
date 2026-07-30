// Los servicios "a coordinar" (ej: Limpieza Energética) se guardan sin
// fecha y/o sin horario, así que hay que mostrarlos como tal en vez de
// dejar el lugar vacío con los separadores colgando.
export function cuando(date, startTime) {
  const hora = startTime ? startTime.slice(0, 5) : null;
  if (!date && !hora) return "A coordinar";
  if (!date) return `${hora} · fecha a coordinar`;
  if (!hora) return `${date} · a coordinar`;
  return `${date} ${hora}`;
}
