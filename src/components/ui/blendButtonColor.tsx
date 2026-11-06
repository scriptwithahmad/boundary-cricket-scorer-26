export function blendButtonColor(base: string, target: string, amount: number) {
  if (!/^#[\da-f]{6}$/i.test(base) || !/^#[\da-f]{6}$/i.test(target)) return base;
  const channels = [1, 3, 5].map((offset) => {
    const from = parseInt(base.slice(offset, offset + 2), 16);
    const to = parseInt(target.slice(offset, offset + 2), 16);
    return Math.round(from + (to - from) * amount).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}
