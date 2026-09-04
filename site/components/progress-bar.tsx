export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress-track" aria-label={`完成度 ${value}%`}>
      <div
        className={`progress-value progress-${color || "coral"}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
