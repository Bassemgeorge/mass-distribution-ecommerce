import { customerStatus } from "@/lib/sourcing";

/** Customer-facing status (pending_approval shows as "Preparing your quote"). */
export default function SourcingStatusPill({ status }: { status: string }) {
  const s = customerStatus(status);
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
      <span>{s.en}</span>
      <span className="opacity-60">/</span>
      <span dir="rtl">{s.ar}</span>
    </span>
  );
}
