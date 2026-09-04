import { statusLabel } from "@/lib/format";

export function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-${status}`}>{statusLabel(status)}</span>;
}
