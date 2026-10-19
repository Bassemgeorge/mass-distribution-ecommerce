import { MIN_MARGIN, margin, money } from "@/lib/sourcing";
import type { StaffLine } from "@/components/sourcing/StaffRequestHeader";

/** Lines with cost, price, margin and supplier — staff/approval pages only, never customer pages. */
export default function StaffLinesTable({ lines }: { lines: StaffLine[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[560px]">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left py-1.5">Item</th>
            <th className="text-right py-1.5">Ctn</th>
            <th className="text-right py-1.5">Cost</th>
            <th className="text-right py-1.5">Price</th>
            <th className="text-right py-1.5">Margin</th>
            <th className="text-left py-1.5 pl-3">Supplier</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => {
            const m = l.margin != null ? Number(l.margin) : margin(Number(l.unit_price), Number(l.unit_cost));
            return (
              <tr key={i} className="border-b border-gray-50 align-top">
                <td className="py-1.5" dir="auto">
                  {l.item_name}
                  {l.pack ? <span className="text-gray-400"> · {l.pack}</span> : null}
                  {l.customer_current_price != null ? (
                    <span className="block text-gray-400">Customer pays now: {money(l.customer_current_price)}</span>
                  ) : null}
                </td>
                <td className="py-1.5 text-right">{l.quantity}</td>
                <td className="py-1.5 text-right">{l.unit_cost != null ? money(l.unit_cost) : "—"}</td>
                <td className="py-1.5 text-right">{money(l.unit_price)}</td>
                <td className={`py-1.5 text-right font-semibold ${m != null && m < MIN_MARGIN ? "text-red-600" : "text-[#177A41]"}`}>
                  {m != null ? `${(m * 100).toFixed(1)}%` : "—"}
                </td>
                <td className="py-1.5 pl-3" dir="auto">
                  {l.supplier ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
