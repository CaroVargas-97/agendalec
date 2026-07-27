export function linkWhatsApp(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9")) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);
  return `https://wa.me/549${d}`;
}
