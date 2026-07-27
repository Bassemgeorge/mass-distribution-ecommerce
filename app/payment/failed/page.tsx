import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="text-red-600" size={36} />
        </div>

        <h1 className="text-2xl font-bold text-[#111111] mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          The payment was not completed. You can go back to checkout and try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors"
          >
            Try Again
          </Link>

          <Link
            href="/cart"
            className="border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:border-[#1B4D2E] transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}