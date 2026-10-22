export function formatBrazilianPhone(value: string): string {
  const digits = value.trim().replace(/^\+55\s*/, '').replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;

  const local = digits.slice(2);
  const prefixLength = digits.length === 11 ? 5 : 4;
  const prefix = local.slice(0, prefixLength);
  const suffix = local.slice(prefixLength);
  return `(${digits.slice(0, 2)}) ${prefix}${suffix ? `-${suffix}` : ''}`;
}

export function isValidBrazilianPhone(value: string): boolean {
  return value === '' || /^\d{10,11}$/.test(value.replace(/\D/g, ''));
}
