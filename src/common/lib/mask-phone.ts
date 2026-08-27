/** يُبقي أول رقمين وآخر رقمين ظاهرين، ويستر الباقي بـX (مثال: 0555123456 → 05XXXXXX56) */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const middle = 'X'.repeat(phone.length - 4);
  return `${start}${middle}${end}`;
}
