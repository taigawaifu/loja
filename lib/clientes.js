export function onlyDigits(value) {
  return (value || "").replace(/\D/g, "");
}

export function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function getWarrantyStatus(isoDate) {
  if (!isoDate) return "none";

  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  if (isoDate < today) return "expired";
  if (isoDate <= inThirtyDays) return "soon";
  return "valid";
}

export async function fetchJson(url) {
  const response = await fetch(url);
  if (response.status === 401) return { unauthorized: true };
  if (response.status === 403) return { forbidden: true };

  const body = await response.json();
  if (!response.ok) return { error: body.message };

  return body;
}