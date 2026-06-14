import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1B4D2E] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm leading-none">M</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Mass Distribution</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              B2B FMCG distribution for Egypt&apos;s HORECA sector. 237 products across 9 top brands — delivered nationwide.
            </p>
            <p className="text-white/50 text-xs mt-3" dir="rtl">
              توزيع منتجات قطاع الضيافة في مصر — 237 منتج من 9 علامات تجارية
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="text-white/70 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Cooking Oil" className="text-white/70 hover:text-white transition-colors">Cooking Oils</Link></li>
              <li><Link href="/products?category=Pasta" className="text-white/70 hover:text-white transition-colors">Pasta</Link></li>
              <li><Link href="/products?brand=Pepsi" className="text-white/70 hover:text-white transition-colors">Beverages</Link></li>
              <li><Link href="/cart" className="text-white/70 hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/account" className="text-white/70 hover:text-white transition-colors">My Account</Link></li>
            </ul>
            <div className="mt-6">
              <p className="text-white/50 text-xs">Cairo, Egypt</p>
              <p className="text-white/50 text-xs mt-1">Since 2017</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <p className="text-white/50">&copy; {new Date().getFullYear()} Mass Distribution. All rights reserved.</p>
          <p className="text-white/50">HORECA · Egypt · B2B</p>
        </div>
      </div>
    </footer>
  );
}
