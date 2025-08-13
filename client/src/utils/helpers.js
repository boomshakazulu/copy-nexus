export function formatCOP(value, short = false) {
  if (value == null || isNaN(value)) return "";

  if (short) {
    // Short format: K for thousands, MM for millions
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`; // e.g., $52.3MM
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`; // e.g., $40.9K
    }
    return `$${value}`;
  }

  // Full Colombian format with period thousand separators
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
}
