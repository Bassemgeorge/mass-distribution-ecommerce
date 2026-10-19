"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, FileText, Loader2, Paperclip, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useRequireLogin";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILES,
  MAX_FILE_BYTES,
  SOURCING_BUCKET,
  formatCairo,
  safeFileName,
} from "@/lib/sourcing";

type Tab = "item" | "invoice";
type FileState = { file: File; status: "waiting" | "uploading" | "done" | "error" };

function PolicyBox() {
  const rows: [string, string][] = [
    [
      "Quotes by 7 PM the same day for requests before 3 PM (Sun–Thu); otherwise by 12 noon the next working day.",
      "عرض السعر قبل ٧ مساءً في نفس اليوم للطلبات قبل ٣ العصر (الأحد–الخميس)، وإلا قبل ١٢ الضهر يوم العمل اللي بعده.",
    ],
    [
      "Minimum 1 carton per item. Quotes are valid for 48 hours.",
      "الحد الأدنى كرتونة لكل صنف. عرض السعر صالح ٤٨ ساعة.",
    ],
    [
      "Special-order items can't be returned unless damaged. Payment follows your account (cash on delivery or credit).",
      "الأصناف المطلوبة خصيصاً مش بترجع إلا لو فيها تلف. الدفع حسب حسابك (كاش عند الاستلام أو آجل).",
    ],
    [
      "Your invoice is only used to prepare your quote and is never shared.",
      "فاتورتك بتستخدم بس عشان نجهز عرض السعر ومش بتتشارك مع حد.",
    ],
  ];
  return (
    <ul className="bg-[#1B4D2E]/5 border border-[#1B4D2E]/15 rounded-xl px-4 py-3 space-y-2 text-xs text-gray-700">
      {rows.map(([en, ar]) => (
        <li key={en} className="flex gap-2">
          <CheckCircle2 size={14} className="text-[#177A41] flex-shrink-0 mt-0.5" />
          <span>
            {en}
            <span className="block text-gray-500 mt-0.5" dir="rtl">
              {ar}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function SourcingNewContent() {
  const { user, loading } = useRequireLogin();
  const { companies, activeCompany } = useActiveCompany();
  const multiCompany = companies.length > 1;
  // Group buyers pick the company; default to the one currently chosen in the header
  const [companyChoice, setCompanyChoice] = useState<string | null>(null);
  const companyId = companyChoice ?? activeCompany?.id ?? companies[0]?.id ?? "";
  const params = useSearchParams();
  const initialTab: Tab = params.get("tab") === "invoice" ? "invoice" : "item";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [details, setDetails] = useState(params.get("q") ?? "");
  const [quantity, setQuantity] = useState("");
  const [files, setFiles] = useState<FileState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string; ref: string; due_at: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than 10 MB. / الملف أكبر من ١٠ ميجا.`);
      return;
    }
    const wrongType = incoming.find((f) => !ACCEPTED_FILE_TYPES.split(",").includes(f.type));
    if (wrongType) {
      setError(`"${wrongType.name}" isn't a photo or PDF. / الملف لازم يكون صورة أو PDF.`);
      return;
    }
    setFiles((prev) => {
      const next = [...prev, ...incoming.map((file) => ({ file, status: "waiting" as const }))];
      if (next.length > MAX_FILES) setError(`Up to ${MAX_FILES} files. / الحد الأقصى ${MAX_FILES} ملفات.`);
      return next.slice(0, MAX_FILES);
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (tab === "item" && details.trim().length < 3 && files.length === 0) {
      setError("Please describe what you need or attach a photo. / اكتب الصنف اللي محتاجه أو ابعت صورة.");
      return;
    }
    if (tab === "invoice" && files.length === 0) {
      setError("Please attach your supplier invoice (photo or PDF). / برجاء رفع فاتورة المورد (صورة أو PDF).");
      return;
    }
    if (multiCompany && !companyId) {
      setError("Please choose the company. / برجاء اختيار الشركة.");
      return;
    }

    setSubmitting(true);
    const paths: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "uploading" } : f)));
        const path = `${user.id}/${Date.now()}-${safeFileName(files[i].file.name)}`;
        const { error: upErr } = await supabase.storage
          .from(SOURCING_BUCKET)
          .upload(path, files[i].file, { contentType: files[i].file.type, upsert: false });
        if (upErr) {
          setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "error" } : f)));
          throw new Error(`Couldn't upload "${files[i].file.name}": ${upErr.message}`);
        }
        paths.push(path);
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "done" } : f)));
      }

      const { data, error: rpcErr } = await supabase.rpc("sourcing_submit", {
        p_kind: tab,
        p_details: details.trim(),
        p_quantity: tab === "item" ? quantity.trim() : "",
        p_attachments: paths,
        p_customer: companyId || null,
      });
      if (rpcErr) throw new Error(rpcErr.message);
      setDone(data as { id: string; ref: string; due_at: string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[70vh] bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle2 size={44} className="text-[#177A41] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111111]">Request {done.ref} received</h1>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">
            استلمنا طلبك {done.ref}
          </p>
          <p className="text-gray-600 text-sm mt-4">
            Your quote will be ready by <span className="font-semibold text-[#111111]">{formatCairo(done.due_at)}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1" dir="rtl">
            عرض السعر هيكون جاهز قبل {formatCairo(done.due_at)}
          </p>
          <Link
            href={`/account/requests/${done.id}`}
            className="mt-6 inline-flex w-full justify-center bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] text-sm"
          >
            Track your request / تابع طلبك
          </Link>
        </div>
      </div>
    );
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] bg-white";

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#111111] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Sourcing Desk</h1>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">مكتب التوريد</p>
          <p className="text-gray-300 text-sm mt-3">
            Can&apos;t find an item? Or want to beat your current supplier? Tell us and get a quote the same day.
          </p>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">
            مش لاقي صنف؟ أو عايز سعر أحسن من موردك؟ قولنا وهنبعتلك عرض سعر في نفس اليوم.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <PolicyBox />

        <div className="grid grid-cols-2 gap-2 bg-white border border-gray-200 rounded-xl p-1">
          {(
            [
              ["item", "Request an item", "اطلب صنف"],
              ["invoice", "Beat my invoice", "قارن فاتورتي"],
            ] as const
          ).map(([key, en, ar]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setError(null);
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                tab === key ? "bg-[#1B4D2E] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {en} <span className="opacity-70">/</span> <span dir="rtl">{ar}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {multiCompany && (
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                For which company? · <span dir="rtl">لأي شركة؟</span> <span className="text-red-400">*</span>
              </span>
              <select
                value={companyId}
                onChange={(e) => setCompanyChoice(e.target.value)}
                dir="auto"
                required
                className={inp}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {tab === "item" ? (
            <>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                  What do you need? · <span dir="rtl">محتاج إيه؟</span>
                </span>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  dir="auto"
                  className={`${inp} resize-none`}
                  placeholder="Brand, size, pack — e.g. Barilla Penne 500g, carton of 24"
                />
                <span className="block text-[11px] text-gray-400 mt-1">Required unless you attach a photo · مطلوب إلا لو بعت صورة</span>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Quantity · <span dir="rtl">الكمية</span>
                </span>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  dir="auto"
                  className={inp}
                  placeholder="e.g. 10 cartons a week / ١٠ كراتين في الأسبوع"
                />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                Note (optional) · <span dir="rtl">ملاحظة (اختياري)</span>
              </span>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                dir="auto"
                className={`${inp} resize-none`}
                placeholder="Anything we should know — e.g. which items matter most"
              />
            </label>
          )}

          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1.5">
              {tab === "invoice" ? (
                <>
                  Supplier invoice (photo or PDF) — required · <span dir="rtl">فاتورة المورد (صورة أو PDF) — مطلوبة</span>
                </>
              ) : (
                <>
                  Photos (optional) · <span dir="rtl">صور (اختياري)</span>
                </>
              )}
            </span>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={tab === "invoice" ? ACCEPTED_FILE_TYPES : "image/jpeg,image/png,image/webp,image/heic,image/heif"}
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
              id="sourcing-files"
            />
            <label
              htmlFor="sourcing-files"
              className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 text-sm cursor-pointer transition-colors ${
                files.length >= MAX_FILES
                  ? "border-gray-200 text-gray-300 pointer-events-none"
                  : "border-gray-300 text-gray-500 hover:border-[#1B4D2E] hover:text-[#1B4D2E]"
              }`}
            >
              <Paperclip size={16} /> Add files · أضف ملفات ({files.length}/{MAX_FILES}, max 10 MB each)
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li key={`${f.file.name}-${i}`} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate flex-1" dir="auto">
                      {f.file.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {f.status === "uploading" ? (
                        <Loader2 size={13} className="animate-spin text-[#1B4D2E]" />
                      ) : f.status === "done" ? (
                        <CheckCircle2 size={13} className="text-[#177A41]" />
                      ) : f.status === "error" ? (
                        <AlertCircle size={13} className="text-red-500" />
                      ) : (
                        `${(f.file.size / 1024 / 1024).toFixed(1)} MB`
                      )}
                    </span>
                    {!submitting && (
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${f.file.name}`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] text-sm disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {files.some((f) => f.status === "uploading")
                  ? `Uploading ${files.filter((f) => f.status === "done").length + 1} of ${files.length}…`
                  : "Sending…"}
              </>
            ) : (
              <>
                <Search size={15} /> Get my quote / ابعتلي عرض سعر
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SourcingNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
        </div>
      }
    >
      <SourcingNewContent />
    </Suspense>
  );
}
