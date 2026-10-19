import { FileText } from "lucide-react";
import { STAFF_STATUS_LABEL, attachmentName, formatCairo, kindLabel } from "@/lib/sourcing";

export interface StaffView {
  ok: boolean;
  id: string;
  ref: string;
  kind: string;
  details: string;
  quantity: string | null;
  attachments: string[] | null;
  status: string;
  handler: string | null;
  created_at: string;
  due_at: string | null;
  approval_note: string | null;
  customer_note: string | null;
  unavailable_reason: string | null;
  alternative: string | null;
  customer: { business_name: string | null; name: string | null; phone: string | null; address: string | null; is_credit: boolean | null };
  lines: StaffLine[];
  min_margin?: number;
}

export interface StaffLine {
  item_name: string;
  pack: string | null;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  lead_time_days: number | null;
  customer_current_price: number | null;
  notes: string | null;
  unit_cost: number | null;
  supplier: string | null;
  margin: number | null;
}

/** Request + customer summary shown on the staff quote and approval pages. */
export default function StaffRequestHeader({ view }: { view: StaffView }) {
  const kind = kindLabel(view.kind);
  const overdue = !!view.due_at && new Date(view.due_at).getTime() < Date.now() && ["received", "sourcing"].includes(view.status);
  const files = view.attachments ?? [];
  const c = view.customer;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-bold font-mono text-[#111111]">{view.ref}</h1>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
          {STAFF_STATUS_LABEL[view.status] ?? view.status}
        </span>
        <span className="text-xs text-gray-500">
          {kind.en} / <span dir="rtl">{kind.ar}</span>
        </span>
      </div>

      <div className="grid gap-1">
        <p className="font-semibold text-[#111111]" dir="auto">
          {c.business_name ?? "—"}
          {c.is_credit && (
            <span className="ml-2 align-middle text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#1B4D2E]/30 text-[#1B4D2E] bg-[#1B4D2E]/5">
              Credit
            </span>
          )}
        </p>
        <p className="text-gray-600" dir="auto">
          {c.name ?? "—"} ·{" "}
          {c.phone ? (
            <a href={`tel:${c.phone}`} className="text-[#1B4D2E] underline" dir="ltr">
              {c.phone}
            </a>
          ) : (
            "—"
          )}
        </p>
        {c.address && (
          <p className="text-gray-500" dir="auto">
            {c.address}
          </p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
        <p className="text-[#111111] whitespace-pre-line" dir="auto">
          {view.details}
        </p>
        {view.quantity && (
          <p className="text-gray-600">
            <span className="text-gray-400">Quantity:</span> <span dir="auto">{view.quantity}</span>
          </p>
        )}
        {files.length > 0 && (
          <div className="pt-1">
            <ul className="space-y-1">
              {files.map((p) => (
                <li key={p} className="flex items-center gap-2 text-gray-600">
                  <FileText size={13} className="text-gray-400" /> {attachmentName(p)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-1">Open the files from the email.</p>
          </div>
        )}
      </div>

      <p className={`text-sm font-semibold ${overdue ? "text-red-600" : "text-gray-700"}`}>
        Due {formatCairo(view.due_at)}
        {overdue ? " · overdue" : ""}
        {view.handler ? <span className="font-normal text-gray-500"> · Handler: {view.handler}</span> : null}
      </p>
    </section>
  );
}
