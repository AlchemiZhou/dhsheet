export function Tick({ rect, checked }: { rect: number[]; checked: boolean }) {
  if (!checked) return null;
  const [x, y, x2, y2] = rect,
    w = x2 - x,
    h = y2 - y;
  return (
    <path
      className="reference-tick"
      d={`M${x + w * 0.16} ${y + h * 0.53}l${w * 0.24} ${h * 0.28} ${w * 0.47} ${-h * 0.64}`}
    />
  );
}
