"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-red-50 text-red-700 border-red-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  closed:    "bg-green-50 text-[#1B4D2E] border-green-200",
};

interface Inquiry {
  id: string;
  created_at: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  business_type: string | null;
  area: string | null;
  message: string | null;
  heard_from: string | null;
  status: string;
}

const FILTERS = ["All", "new", "contacted", "closed"];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading,   setLoad]      = useState(true);
  const [filter,    setFilter]    = useState("All");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [updating,  setUpd]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Inquiries fetch error:", error.message);
    setInquiries((data as Inquiry[]) ?? []);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpd(id);
    await supabase.from("inquiries").update({ status }).eq("id", id);
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    setUpd(null);
  }

  const filtered = filter === "All" ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Inquiries</h1>
          <p className="text-gray-400 text-sm">{inquiries.length} total · {inquiries.filter((i) => i.status === "new").length} new</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4D2E] transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {f === "All" ? `All (${inquiries.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${inquiries.filter((i) => i.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No inquiries in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((inq) => (
              <div key={inq.id}>
                {/* Row */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                      className="flex items-start gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold text-[#1B4D2E]">
                        {(inq.business_name ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#111111]">{inq.business_name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[inq.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                          </span>
                          {inq.business_type && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{inq.business_type}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{inq.contact_name} · {inq.phone} · {inq.email}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {inq.area && `${inq.area} · `}
                          {new Date(inq.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {inq.message && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{inq.message}</p>
                        )}
                      </div>
                      <div className="text-gray-300 flex-shrink-0 mt-1">
                        {expanded === inq.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {/* Status actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      {inq.status === "new" && (
                        <button
                          onClick={() => updateStatus(inq.id, "contacted")}
                          disabled={updating === inq.id}
                          className="text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium border border-amber-200 disabled:opacity-50"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {inq.status === "contacted" && (
                        <button
                          onClick={() => updateStatus(inq.id, "closed")}
                          disabled={updating === inq.id}
                          className="text-xs px-2.5 py-1.5 bg-green-50 text-[#1B4D2E] rounded-lg hover:bg-green-100 transition-colors font-medium border border-green-200 disabled:opacity-50"
                        >
                          Mark Closed
                        </button>
                      )}
                      {inq.status === "closed" && (
                        <button
                          onClick={() => updateStatus(inq.id, "new")}
                          disabled={updating === inq.id}
                          className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded message */}
                  {expanded === inq.id && (
                    <div className="mt-4 ml-12 bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><p className="text-gray-400 mb-0.5">Business Type</p><p className="font-medium">{inq.business_type ?? "—"}</p></div>
                        <div><p className="text-gray-400 mb-0.5">Area</p><p className="font-medium">{inq.area ?? "—"}</p></div>
                        <div><p className="text-gray-400 mb-0.5">Phone</p><a href={`tel:${inq.phone}`} className="font-medium text-[#1B4D2E] hover:underline">{inq.phone}</a></div>
                        <div><p className="text-gray-400 mb-0.5">Heard From</p><p className="font-medium">{inq.heard_from ?? "—"}</p></div>
                      </div>
                      {inq.email && (
                        <div className="text-xs"><p className="text-gray-400 mb-0.5">Email</p><a href={`mailto:${inq.email}`} className="font-medium text-[#1B4D2E] hover:underline">{inq.email}</a></div>
                      )}
                      {inq.message && (
                        <div className="text-xs">
                          <p className="text-gray-400 mb-1">Message / Requirements</p>
                          <p className="text-gray-700 leading-relaxed bg-white rounded-lg p-3 border border-gray-100">{inq.message}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <a href={`tel:${inq.phone}`} className="text-xs px-3 py-1.5 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#163d24] transition-colors">Call</a>
                        <a href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe5d] transition-colors">WhatsApp</a>
                        {inq.email && <a href={`mailto:${inq.email}`} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Email</a>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
